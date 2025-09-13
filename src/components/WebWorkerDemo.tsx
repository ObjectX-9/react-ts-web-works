import React, { useState, useEffect, useRef } from "react";
import { useWebWorker } from "../hooks/useWebWorker";
import "./WebWorkerDemo.less";

const WebWorkerDemo: React.FC = () => {
  const {
    isLoading,
    result,
    error,
    progress,
    postMessage,
    reset,
    isSupported,
  } = useWebWorker();
  const [taskType, setTaskType] = useState<
    "fibonacci" | "primes" | "calculation"
  >("fibonacci");
  const [isMainThreadBlocked, setIsMainThreadBlocked] = useState(false);
  const [mainThreadResult, setMainThreadResult] = useState<any>(null);
  const [mainThreadTime, setMainThreadTime] = useState<number>(0);

  // 动画状态
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef<number>();

  // 启动动画
  useEffect(() => {
    const animate = () => {
      setRotation((prev) => (prev + 2) % 360);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // 主线程执行斐波那契计算（会阻塞UI）
  const runMainThreadFibonacci = (n: number) => {
    setIsMainThreadBlocked(true);
    setMainThreadResult(null);

    setTimeout(() => {
      const start = performance.now();

      function fibonacciSlow(num: number): number {
        if (num <= 1) return num;
        return fibonacciSlow(num - 1) + fibonacciSlow(num - 2);
      }

      const result = fibonacciSlow(n);
      const end = performance.now();
      const timeElapsed = end - start;

      setMainThreadResult(result);
      setMainThreadTime(timeElapsed);
      setIsMainThreadBlocked(false);
    }, 100);
  };

  const handleWorkerTask = () => {
    reset();
    setMainThreadResult(null);

    switch (taskType) {
      case "fibonacci":
        postMessage("FIBONACCI", { n: 40 });
        break;
      case "primes":
        postMessage("PRIME_NUMBERS", { start: 1, end: 100000 });
        break;
      case "calculation":
        postMessage("CALCULATE", { iterations: 50000000 });
        break;
    }
  };

  const handleMainThreadTask = () => {
    switch (taskType) {
      case "fibonacci":
        runMainThreadFibonacci(40);
        break;
      default:
        setMainThreadResult({ error: "主线程演示仅支持斐波那契计算" });
    }
  };

  const getStatusClass = () => {
    if (isLoading) return "loading";
    if (isMainThreadBlocked) return "blocked";
    return "normal";
  };

  const getStatusText = () => {
    if (isLoading) return "⚠️ Web Worker 运行中";
    if (isMainThreadBlocked) return "🔴 主线程阻塞中";
    return "✅ 页面响应正常";
  };

  if (!isSupported) {
    return (
      <div className="web-worker-demo">
        <div className="not-supported">
          <h1>❌ 您的浏览器不支持 Web Worker</h1>
          <p>请使用现代浏览器访问此演示</p>
        </div>
      </div>
    );
  }

  return (
    <div className="web-worker-demo">
      <h1 className="title">🔧 Web Worker 实时演示</h1>

      <div className="info-section">
        <h2>💡 Web Worker 的作用</h2>
        <p>
          Web Worker 可以在后台线程执行 JavaScript
          代码，不会阻塞主线程（UI线程）。
          这对于执行复杂计算、数据处理等耗时操作非常有用。
        </p>
      </div>

      <div className="task-selection">
        <h3>选择任务类型:</h3>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              value="fibonacci"
              checked={taskType === "fibonacci"}
              onChange={(e) => setTaskType(e.target.value as any)}
            />
            斐波那契数列 (第40项)
          </label>
          <label>
            <input
              type="radio"
              value="primes"
              checked={taskType === "primes"}
              onChange={(e) => setTaskType(e.target.value as any)}
            />
            素数计算 (1-100000)
          </label>
          <label>
            <input
              type="radio"
              value="calculation"
              checked={taskType === "calculation"}
              onChange={(e) => setTaskType(e.target.value as any)}
            />
            密集数学计算
          </label>
        </div>
      </div>

      <div className="button-group">
        <button
          onClick={handleWorkerTask}
          disabled={isLoading || isMainThreadBlocked}
          className="btn btn-primary"
        >
          {isLoading ? "🔄 Web Worker 计算中..." : "🚀 使用 Web Worker 计算"}
        </button>

        {taskType === "fibonacci" && (
          <button
            onClick={handleMainThreadTask}
            disabled={isMainThreadBlocked || isLoading}
            className="btn btn-danger"
          >
            {isMainThreadBlocked
              ? "⏳ 主线程计算中..."
              : "⚠️ 主线程计算（会卡顿）"}
          </button>
        )}
      </div>

      <div className="animation-section">
        <h3>🎯 页面响应性测试</h3>
        <p>下面的动画可以帮助您观察页面是否被阻塞：</p>

        <div className="main-animation">
          <div
            className="rotating-square"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div className="indicator-dot" />
            <div className="indicator-arrow" />
          </div>

          <div className="rotation-counter">
            旋转角度: {rotation.toFixed(0)}°
          </div>
        </div>

        <div className="observation-points">
          <p>
            <strong>🔍 观察要点：</strong>
            <br />• 使用 Web Worker 时：正方形持续旋转，角度数字持续更新
            <br />• 主线程计算时：动画会明显卡顿或完全停止
            <br />• 正方形的角和白色指示器让旋转效果更明显
          </p>
        </div>
      </div>

      <div className="performance-section">
        <h4>📊 实时性能指示器</h4>

        <div className="status-info">
          <div className="status-item">
            <strong>动画帧数:</strong> {Math.floor(rotation / 2)}
          </div>
          <div className="status-item">
            <strong>状态:</strong>
            <span className={`status-badge ${getStatusClass()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>

        <div className="horizontal-animation">
          <div className="track">
            <div
              className="moving-square"
              style={{ left: `${(rotation * 1.5) % 275}px` }}
            />
          </div>
          <div className="description">
            水平移动指示器 - 也会在主线程阻塞时停止
          </div>
        </div>

        <div className="multi-speed-test">
          <div className="label">多速度测试:</div>

          <div
            className="speed-square slow"
            style={{ transform: `rotate(${rotation * 0.5}deg)` }}
          >
            <div className="mini-dot" />
          </div>

          <div
            className="speed-square medium"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div className="mini-dot" />
          </div>

          <div
            className="speed-square fast"
            style={{ transform: `rotate(${rotation * 2}deg)` }}
          >
            <div className="mini-dot" />
          </div>

          <div className="speed-labels">慢 | 中 | 快</div>
        </div>
      </div>

      {/* Web Worker 进度条 */}
      {isLoading && progress > 0 && (
        <div className="progress-section">
          <div className="progress-label">Web Worker 计算进度: {progress}%</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Web Worker 结果显示 */}
      {result && (
        <div className="result-section success">
          <h3>✅ Web Worker 计算结果:</h3>
          <div className="result-content">
            {JSON.stringify(result, null, 2)}
          </div>
        </div>
      )}

      {/* 主线程结果显示 */}
      {mainThreadResult && (
        <div
          className={`result-section ${
            mainThreadResult.error ? "error" : "warning"
          }`}
        >
          <h3>
            {mainThreadResult.error
              ? "❌ 主线程计算错误:"
              : "⚠️ 主线程计算结果:"}
          </h3>
          {mainThreadResult.error ? (
            <p>{mainThreadResult.error}</p>
          ) : (
            <div className="result-details">
              <p>
                <strong>结果:</strong> {mainThreadResult}
              </p>
              <p>
                <strong>耗时:</strong> {mainThreadTime.toFixed(2)}ms
              </p>
              <p>
                <strong>观察:</strong> 在计算过程中，上方的动画是否停止了？
              </p>
            </div>
          )}
        </div>
      )}

      {/* 错误显示 */}
      {error && (
        <div className="error-section">
          <h3>❌ Web Worker 错误:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default WebWorkerDemo;
