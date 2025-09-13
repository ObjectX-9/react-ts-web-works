import React, { useState, useRef, useEffect } from "react";
import "./BabelWorkerDemo.less";

interface BabelResult {
  type: "RESULT" | "ERROR" | "PROGRESS";
  data: any;
  progress?: number;
}

const BabelWorkerDemo: React.FC = () => {
  const [inputCode, setInputCode] = useState("");
  const [outputCode, setOutputCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [compilationType, setCompilationType] = useState<
    "tsx" | "js" | "validate"
  >("tsx");
  const [isSupported, setIsSupported] = useState(true);
  const [compilationStats, setCompilationStats] = useState<any>(null);

  const workerRef = useRef<Worker | null>(null);

  // 示例代码
  const examples = {
    tsx: `import React, { useState } from 'react';

interface Props {
  title: string;
  count?: number;
}

const Counter: React.FC<Props> = ({ title, count = 0 }) => {
  const [value, setValue] = useState<number>(count);

  const handleIncrement = (): void => {
    setValue(prev => prev + 1);
  };

  return (
    <div className="counter">
      <h2>{title}</h2>
      <p>当前计数: {value}</p>
      <button onClick={handleIncrement}>
        点击增加
      </button>
    </div>
  );
};

export default Counter;`,

    js: `const sum = (a, b) => a + b;

const numbers = [1, 2, 3, 4, 5];
const result = numbers
  .map(x => x * 2)
  .filter(x => x > 5)
  .reduce((acc, curr) => acc + curr, 0);

class Calculator {
  constructor(initial = 0) {
    this.value = initial;
  }

  add(num) {
    this.value += num;
    return this;
  }

  multiply(num) {
    this.value *= num;
    return this;
  }

  getValue() {
    return this.value;
  }
}

export { Calculator, sum };`,

    validate: `// 这段代码有语法错误
import React from 'react'

const Component = () => {
  return (
    <div>
      <h1>测试组件</h1>
      <p>这是一个有语法错误的示例</p>
      // 缺少闭合标签
    <div>
  );
};`,
  };

  // 初始化 Worker
  useEffect(() => {
    if (typeof Worker === "undefined") {
      setIsSupported(false);
      return;
    }

    try {
      workerRef.current = new Worker(
        new URL("../workers/babel.worker.ts", import.meta.url),
        { type: "module" }
      );

      workerRef.current.onmessage = (event: MessageEvent<BabelResult>) => {
        const { type, data, progress: progressValue } = event.data;

        if (type === "PROGRESS") {
          setProgress(progressValue || 0);
          return;
        }

        if (type === "ERROR") {
          setError(data.error);
          setIsLoading(false);
          setProgress(0);
          return;
        }

        if (type === "RESULT") {
          setIsLoading(false);
          setProgress(100);
          setError(null);

          if (data.type === "SYNTAX_VALIDATION") {
            if (data.valid) {
              setOutputCode("✅ 语法正确！\n\n" + data.message);
            } else {
              setOutputCode(
                `❌ 语法错误：\n\n${data.error}\n\n${
                  data.loc
                    ? `位置: 行 ${data.loc.line}, 列 ${data.loc.column}`
                    : ""
                }`
              );
            }
          } else {
            if (data.success) {
              setOutputCode(data.code || "编译成功，但无输出代码");
              setCompilationStats({
                filename: data.filename,
                originalLines: data.originalCode?.split("\n").length || 0,
                compiledLines: data.code?.split("\n").length || 0,
                hasSourceMap: !!data.map,
                hasAST: !!data.ast,
              });
            } else {
              setOutputCode(
                `❌ 编译错误：\n\n${data.error}\n\n${
                  data.loc
                    ? `位置: 行 ${data.loc.line}, 列 ${data.loc.column}`
                    : ""
                }`
              );
              setCompilationStats(null);
            }
          }

          // 2秒后清除进度条
          setTimeout(() => setProgress(0), 2000);
        }
      };

      workerRef.current.onerror = (error) => {
        setError(`Worker 错误: ${error.message}`);
        setIsLoading(false);
        setProgress(0);
      };

      // 设置默认示例
      setInputCode(examples.tsx);
    } catch (err) {
      setIsSupported(false);
      console.error("Worker 初始化失败:", err);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const handleCompile = () => {
    if (!workerRef.current || !inputCode.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutputCode("");
    setProgress(0);
    setCompilationStats(null);

    const messageType = {
      tsx: "COMPILE_TSX",
      js: "COMPILE_JS",
      validate: "VALIDATE_SYNTAX",
    }[compilationType];

    workerRef.current.postMessage({
      type: messageType,
      data: {
        code: inputCode,
        filename: `example.${compilationType === "tsx" ? "tsx" : "js"}`,
      },
    });
  };

  const handleExampleLoad = (type: keyof typeof examples) => {
    setInputCode(examples[type]);
    setCompilationType(type === "validate" ? "tsx" : type);
    setOutputCode("");
    setError(null);
    setCompilationStats(null);
  };

  const handleClear = () => {
    setInputCode("");
    setOutputCode("");
    setError(null);
    setCompilationStats(null);
  };

  if (!isSupported) {
    return (
      <div className="not-supported">
        <h1>❌ 您的浏览器不支持 Web Worker</h1>
        <p>请使用现代浏览器访问此演示</p>
      </div>
    );
  }

  return (
    <div className="babel-worker-demo">
      <h1 className="title">⚛️ Babel Worker 在线编译器</h1>

      <div className="info-section">
        <h2>💡 Babel Worker 的作用</h2>
        <p>
          通过在 Web Worker 中运行 Babel，我们可以在后台编译 TypeScript/JSX
          代码而不阻塞主线程。
          这对于在线代码编辑器、实时预览工具等应用场景非常有用。支持 TSX/JSX
          转换、TypeScript 编译和语法验证。
        </p>
      </div>

      <div className="features-section">
        <h3>🚀 主要功能</h3>
        <div className="features-grid">
          <div className="feature-item">
            <h4>⚛️ TSX/JSX 编译</h4>
            <p>将 React TypeScript 组件编译为 JavaScript</p>
          </div>
          <div className="feature-item">
            <h4>📝 ES6+ 转换</h4>
            <p>转换现代 JavaScript 语法为兼容代码</p>
          </div>
          <div className="feature-item">
            <h4>🔍 语法验证</h4>
            <p>实时检查代码语法错误和问题</p>
          </div>
          <div className="feature-item">
            <h4>🗺️ Source Maps</h4>
            <p>生成源码映射便于调试</p>
          </div>
        </div>
      </div>

      <div className="controls-section">
        <div className="control-group">
          <label>编译类型:</label>
          <select
            value={compilationType}
            onChange={(e) => setCompilationType(e.target.value as any)}
            disabled={isLoading}
          >
            <option value="tsx">TSX/JSX 编译</option>
            <option value="js">JavaScript 转换</option>
            <option value="validate">语法验证</option>
          </select>
        </div>

        <button
          onClick={handleCompile}
          disabled={isLoading || !inputCode.trim()}
          className="btn btn-primary"
        >
          {isLoading ? "🔄 编译中..." : "🚀 开始编译"}
        </button>

        <button
          onClick={handleClear}
          disabled={isLoading}
          className="btn btn-secondary"
        >
          🗑️ 清空
        </button>
      </div>

      <div className="examples-section">
        <h3>📋 示例代码</h3>
        <div className="example-buttons">
          <button
            onClick={() => handleExampleLoad("tsx")}
            className="example-btn"
            disabled={isLoading}
          >
            📱 React 组件
          </button>
          <button
            onClick={() => handleExampleLoad("js")}
            className="example-btn"
            disabled={isLoading}
          >
            📦 ES6+ 代码
          </button>
          <button
            onClick={() => handleExampleLoad("validate")}
            className="example-btn"
            disabled={isLoading}
          >
            🐛 语法错误示例
          </button>
        </div>
      </div>

      {/* 进度条 */}
      {isLoading && progress > 0 && (
        <div className="progress-section">
          <div className="progress-label">编译进度: {progress}%</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="editor-section">
        <div className="editor-panel">
          <div className="panel-header">
            📝 输入代码 (
            {compilationType === "tsx"
              ? "TSX"
              : compilationType === "js"
              ? "JS"
              : "Validation"}
            )
          </div>
          <textarea
            className="code-editor"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            disabled={isLoading}
            placeholder="请输入要编译的代码..."
          />
        </div>

        <div className="editor-panel">
          <div className="panel-header">📤 编译结果</div>
          <div
            className={`output-area ${
              error ? "error" : outputCode ? "success" : ""
            }`}
          >
            {isLoading ? "⏳ 正在编译..." : outputCode || "等待编译..."}
          </div>
        </div>
      </div>

      {/* 编译统计 */}
      {compilationStats && (
        <div className="result-section info">
          <h3 className="info">📊 编译统计</h3>
          <div className="compilation-stats">
            <div className="stat-item">
              <div className="stat-label">文件名</div>
              <div className="stat-value">{compilationStats.filename}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">原始行数</div>
              <div className="stat-value">{compilationStats.originalLines}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">编译后行数</div>
              <div className="stat-value">{compilationStats.compiledLines}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Source Map</div>
              <div className="stat-value">
                {compilationStats.hasSourceMap ? "✅" : "❌"}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">AST</div>
              <div className="stat-value">
                {compilationStats.hasAST ? "✅" : "❌"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 错误显示 */}
      {error && (
        <div className="result-section error">
          <h3 className="error">❌ 编译错误</h3>
          <div className="result-content">{error}</div>
        </div>
      )}
    </div>
  );
};

export default BabelWorkerDemo;
