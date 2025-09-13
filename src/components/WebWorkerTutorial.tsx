import React from "react";
import "./WebWorkerTutorial.less";

const WebWorkerTutorial: React.FC = () => {
  return (
    <div className="web-worker-tutorial">
      <h1>📚 Web Worker 使用指南与原理解析</h1>

      {/* Web Worker 简介 */}
      <section className="tutorial-section">
        <h2>🎯 什么是 Web Worker？</h2>
        <div className="content-card">
          <p>
            Web Worker 是 HTML5 提供的一个 JavaScript
            API，它允许在浏览器中创建后台线程来执行脚本，
            这些脚本独立于主线程（UI线程）运行，不会阻塞用户界面的更新和用户交互。
          </p>
          <div className="highlight-box">
            <h4>🔍 核心特点：</h4>
            <ul>
              <li>
                <strong>并行执行</strong>：在独立的线程中运行，不阻塞主线程
              </li>
              <li>
                <strong>数据隔离</strong>：拥有独立的全局作用域，无法直接访问
                DOM
              </li>
              <li>
                <strong>消息通信</strong>：通过 postMessage 和 onmessage
                与主线程通信
              </li>
              <li>
                <strong>资源共享</strong>：可以进行网络请求、定时器等操作
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 工作原理 */}
      <section className="tutorial-section">
        <h2>⚙️ 工作原理</h2>
        <div className="content-card">
          <div className="principle-diagram">
            <div className="thread-box main-thread">
              <h4>🏠 主线程 (Main Thread)</h4>
              <ul>
                <li>UI 渲染</li>
                <li>用户交互</li>
                <li>DOM 操作</li>
                <li>创建 Worker</li>
              </ul>
            </div>
            <div className="communication-arrow">
              <div className="arrow-up">📤 postMessage</div>
              <div className="arrow-down">📥 onmessage</div>
            </div>
            <div className="thread-box worker-thread">
              <h4>⚡ Worker 线程</h4>
              <ul>
                <li>复杂计算</li>
                <li>数据处理</li>
                <li>网络请求</li>
                <li>算法执行</li>
              </ul>
            </div>
          </div>
          <div className="note-box">
            <p>
              <strong>注意：</strong>Web Worker 无法直接操作 DOM，所有 DOM
              相关操作必须通过消息传递给主线程处理。
            </p>
          </div>
        </div>
      </section>

      {/* 使用场景 */}
      <section className="tutorial-section">
        <h2>🎯 适用场景</h2>
        <div className="content-card">
          <div className="use-cases">
            <div className="use-case">
              <h4>📊 数据处理</h4>
              <p>大量数据的排序、过滤、转换等操作</p>
            </div>
            <div className="use-case">
              <h4>🔢 复杂计算</h4>
              <p>数学运算、加密解密、图像处理等</p>
            </div>
            <div className="use-case">
              <h4>🌐 网络请求</h4>
              <p>后台数据同步、文件上传下载等</p>
            </div>
            <div className="use-case">
              <h4>🎮 实时处理</h4>
              <p>游戏逻辑、音频处理、实时通信等</p>
            </div>
          </div>
        </div>
      </section>

      {/* 基本用法 */}
      <section className="tutorial-section">
        <h2>💻 基本用法</h2>
        <div className="content-card">
          <h3>1. 检查浏览器支持</h3>
          <div className="code-block">
            <pre>{`if (typeof Worker !== 'undefined') {
  // 浏览器支持 Web Worker
  console.log('支持 Web Worker');
} else {
  // 不支持 Web Worker
  console.log('不支持 Web Worker');
}`}</pre>
          </div>

          <h3>2. 创建 Worker 文件 (worker.js)</h3>
          <div className="code-block">
            <pre>{`// worker.js
self.addEventListener('message', function(e) {
  const { type, data } = e.data;
  
  switch (type) {
    case 'CALCULATE':
      const result = performHeavyCalculation(data);
      self.postMessage({
        type: 'RESULT',
        data: result
      });
      break;
      
    case 'STOP':
      self.close(); // 终止 Worker
      break;
  }
});

function performHeavyCalculation(data) {
  // 执行复杂计算
  let result = 0;
  for (let i = 0; i < data.iterations; i++) {
    result += Math.sqrt(i) * Math.sin(i);
  }
  return result;
}`}</pre>
          </div>

          <h3>3. 在主线程中使用 Worker</h3>
          <div className="code-block">
            <pre>{`// main.js
// 创建 Worker 实例
const worker = new Worker('worker.js');

// 监听 Worker 消息
worker.onmessage = function(e) {
  const { type, data } = e.data;
  
  if (type === 'RESULT') {
    console.log('计算结果:', data);
    // 更新 UI
    document.getElementById('result').textContent = data;
  }
};

// 发送消息给 Worker
worker.postMessage({
  type: 'CALCULATE',
  data: { iterations: 1000000 }
});

// 错误处理
worker.onerror = function(error) {
  console.error('Worker 错误:', error);
};

// 终止 Worker
// worker.terminate();`}</pre>
          </div>
        </div>
      </section>

      {/* React + TypeScript 中的使用 */}
      <section className="tutorial-section">
        <h2>⚛️ 在 React + TypeScript 中使用</h2>
        <div className="content-card">
          <h3>1. TypeScript Worker 文件</h3>
          <div className="code-block">
            <pre>{`// calculator.worker.ts
interface WorkerMessage {
  type: 'CALCULATE' | 'FIBONACCI';
  data: any;
}

interface WorkerResponse {
  type: 'RESULT' | 'ERROR';
  data: any;
}

self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { type, data } = event.data;
  
  try {
    switch (type) {
      case 'FIBONACCI':
        const result = fibonacci(data.n);
        self.postMessage({
          type: 'RESULT',
          data: { result, input: data.n }
        } as WorkerResponse);
        break;
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      data: { error: error.message }
    } as WorkerResponse);
  }
});

function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

export {};`}</pre>
          </div>

          <h3>2. React Hook 封装</h3>
          <div className="code-block">
            <pre>{`// useWebWorker.ts
import { useCallback, useEffect, useRef, useState } from 'react';

interface WorkerState {
  isLoading: boolean;
  result: any;
  error: string | null;
}

export function useWebWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [state, setState] = useState<WorkerState>({
    isLoading: false,
    result: null,
    error: null
  });

  useEffect(() => {
    // 创建 Worker (Vite 支持)
    workerRef.current = new Worker(
      new URL('../workers/calculator.worker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = (event) => {
      const { type, data } = event.data;
      
      if (type === 'RESULT') {
        setState(prev => ({
          ...prev,
          isLoading: false,
          result: data,
          error: null
        }));
      } else if (type === 'ERROR') {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.error
        }));
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const postMessage = useCallback((type: string, data: any) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    workerRef.current?.postMessage({ type, data });
  }, []);

  return { ...state, postMessage };
}`}</pre>
          </div>

          <h3>3. 在组件中使用</h3>
          <div className="code-block">
            <pre>{`// Component.tsx
import React from 'react';
import { useWebWorker } from './hooks/useWebWorker';

const CalculatorComponent: React.FC = () => {
  const { isLoading, result, error, postMessage } = useWebWorker();

  const handleCalculate = () => {
    postMessage('FIBONACCI', { n: 40 });
  };

  return (
    <div>
      <button onClick={handleCalculate} disabled={isLoading}>
        {isLoading ? '计算中...' : '开始计算'}
      </button>
      
      {result && <div>结果: {JSON.stringify(result)}</div>}
      {error && <div>错误: {error}</div>}
    </div>
  );
};`}</pre>
          </div>
        </div>
      </section>

      {/* 最佳实践 */}
      <section className="tutorial-section">
        <h2>✨ 最佳实践</h2>
        <div className="content-card">
          <div className="best-practices">
            <div className="practice-item">
              <h4>🎯 合理使用场景</h4>
              <ul>
                <li>只在真正需要的时候使用 Web Worker</li>
                <li>避免为简单操作创建 Worker（开销大于收益）</li>
                <li>适合 CPU 密集型任务，不适合 I/O 密集型</li>
              </ul>
            </div>

            <div className="practice-item">
              <h4>📡 消息传递优化</h4>
              <ul>
                <li>尽量减少消息传递的频率</li>
                <li>使用 Transferable Objects 传递大数据</li>
                <li>避免传递函数和 DOM 对象</li>
              </ul>
            </div>

            <div className="practice-item">
              <h4>🔧 资源管理</h4>
              <ul>
                <li>及时终止不需要的 Worker</li>
                <li>避免创建过多的 Worker 实例</li>
                <li>处理 Worker 的错误情况</li>
              </ul>
            </div>

            <div className="practice-item">
              <h4>🐛 调试技巧</h4>
              <ul>
                <li>使用浏览器开发者工具调试 Worker</li>
                <li>在 Worker 中使用 console.log</li>
                <li>添加错误处理和日志记录</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 性能对比 */}
      <section className="tutorial-section">
        <h2>📈 性能对比示例</h2>
        <div className="content-card">
          <div className="performance-comparison">
            <div className="comparison-item blocked">
              <h4>❌ 主线程阻塞</h4>
              <div className="timeline">
                <div className="task task-ui">UI 渲染</div>
                <div className="task task-calc blocked">复杂计算 (阻塞)</div>
                <div className="task task-ui blocked">UI 渲染 (被阻塞)</div>
              </div>
              <p>用户体验：页面卡顿，无法交互</p>
            </div>

            <div className="comparison-item non-blocked">
              <h4>✅ Web Worker</h4>
              <div className="timeline">
                <div className="task task-ui">UI 渲染</div>
                <div className="task task-calc worker">复杂计算 (Worker)</div>
                <div className="task task-ui">UI 渲染 (流畅)</div>
              </div>
              <p>用户体验：页面流畅，可正常交互</p>
            </div>
          </div>
        </div>
      </section>

      {/* 注意事项 */}
      <section className="tutorial-section">
        <h2>⚠️ 注意事项与限制</h2>
        <div className="content-card">
          <div className="warning-box">
            <h4>🚫 Worker 中无法访问的 API：</h4>
            <ul>
              <li>DOM 元素和 document 对象</li>
              <li>window 对象</li>
              <li>parent 对象</li>
              <li>某些 HTML5 API（如 localStorage 在某些浏览器中）</li>
            </ul>
          </div>

          <div className="info-box">
            <h4>✅ Worker 中可以使用的 API：</h4>
            <ul>
              <li>XMLHttpRequest / Fetch API</li>
              <li>定时器 (setTimeout, setInterval)</li>
              <li>WebSocket</li>
              <li>IndexedDB</li>
              <li>各种计算相关的 JavaScript API</li>
            </ul>
          </div>

          <div className="tip-box">
            <h4>💡 实用技巧：</h4>
            <ul>
              <li>Worker 脚本必须与主页面同源</li>
              <li>可以在 Worker 中动态导入其他脚本</li>
              <li>
                使用 SharedArrayBuffer 可以实现真正的内存共享（需要特殊头部）
              </li>
              <li>
                Service Worker 是 Web Worker 的特殊形式，主要用于缓存和离线功能
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WebWorkerTutorial;
