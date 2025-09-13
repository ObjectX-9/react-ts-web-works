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

  // 真正的主线程阻塞 - 完全同步，无任何状态控制
  const runMainThreadFibonacci = (n: number) => {
    const start = performance.now();

    // 直接同步计算，会真正阻塞主线程
    function fibonacciSlow(num: number): number {
      if (num <= 1) return num;
      return fibonacciSlow(num - 1) + fibonacciSlow(num - 2);
    }

    const result = fibonacciSlow(n);
    const end = performance.now();
    const timeElapsed = end - start;

    // 计算完成后才更新结果
    setMainThreadResult(result);
    setMainThreadTime(timeElapsed);
  };

  const runMainThreadPrimes = (start: number, end: number) => {
    const startTime = performance.now();

    // 直接同步计算素数
    function isPrime(num: number): boolean {
      if (num <= 1) return false;
      if (num <= 3) return true;
      if (num % 2 === 0 || num % 3 === 0) return false;

      for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
      }
      return true;
    }

    const primes: number[] = [];
    for (let i = start; i <= end; i++) {
      if (isPrime(i)) {
        primes.push(i);
      }
    }

    const endTime = performance.now();
    const timeElapsed = endTime - startTime;

    setMainThreadResult({
      primes,
      count: primes.length,
      range: `${start}-${end}`,
    });
    setMainThreadTime(timeElapsed);
  };

  const runMainThreadCalculation = (iterations: number) => {
    const startTime = performance.now();

    // 直接同步密集计算
    let result = 0;
    for (let i = 0; i < iterations; i++) {
      result += Math.sqrt(i) * Math.sin(i) * Math.cos(i);

      // 增加计算强度
      for (let j = 0; j < 1000; j++) {
        result += Math.random() * 0.000001;
      }
    }

    const endTime = performance.now();
    const timeElapsed = endTime - startTime;

    setMainThreadResult(result);
    setMainThreadTime(timeElapsed);
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

  // 直接执行同步计算，不使用任何状态控制
  const handleMainThreadTask = () => {
    // 清除之前的结果
    setMainThreadResult(null);

    // 直接执行同步计算 - 这里会真正阻塞
    switch (taskType) {
      case "fibonacci":
        runMainThreadFibonacci(42); // 增加到42让阻塞更明显
        break;
      case "primes":
        runMainThreadPrimes(1, 80000); // 增加范围让阻塞更明显
        break;
      case "calculation":
        runMainThreadCalculation(1000000); // 增加迭代次数
        break;
      default:
        setMainThreadResult({ error: "未知任务类型" });
    }
  };

  const getStatusClass = () => {
    if (isLoading) return "loading";
    return "normal";
  };

  const getStatusText = () => {
    if (isLoading) return "⚠️ Web Worker 运行中";
    return "✅ 页面响应正常";
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
            斐波那契数列 (第42项 - 约3-5秒)
          </label>
          <label>
            <input
              type="radio"
              value="primes"
              checked={taskType === "primes"}
              onChange={(e) => setTaskType(e.target.value as any)}
            />
            素数计算 (1-80000 - 约2-3秒)
          </label>
          <label>
            <input
              type="radio"
              value="calculation"
              checked={taskType === "calculation"}
              onChange={(e) => setTaskType(e.target.value as any)}
            />
            密集数学计算 (约2-4秒)
          </label>
        </div>
      </div>

      <div className="button-group">
        <button
          onClick={handleWorkerTask}
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? "🔄 Web Worker 计算中..." : "🚀 使用 Web Worker 计算"}
        </button>

        <button onClick={handleMainThreadTask} className="btn btn-danger">
          ⚠️ 主线程计算（真正会卡死页面）
        </button>
      </div>

      <div className="animation-section">
        <h3>🎯 页面响应性测试</h3>
        <p>
          <strong style={{ color: "#d32f2f" }}>
            ⚠️ 注意：点击"主线程计算"后页面会完全卡死几秒钟！
          </strong>
        </p>

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
            <br />•{" "}
            <span style={{ color: "#d32f2f", fontWeight: "bold" }}>
              主线程计算时：页面完全卡死，无法点击任何按钮，动画完全停止
            </span>
            <br />• 您甚至无法滚动页面或选择文本
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
            水平移动指示器 - 主线程阻塞时会完全停止
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

        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          <strong>🚨 真实阻塞测试：</strong>
          <br />
          1. 观察上方动画正常运行
          <br />
          2. 点击"主线程计算"按钮
          <br />
          3. 立即尝试点击其他按钮或滚动页面
          <br />
          4. 您会发现页面完全无响应，这就是真正的主线程阻塞！
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
          <h3>✅ Web Worker 计算结果 (页面保持响应):</h3>
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
              : "⚠️ 主线程计算结果 (页面刚刚卡死了):"}
          </h3>
          {mainThreadResult.error ? (
            <p>{mainThreadResult.error}</p>
          ) : (
            <div className="result-details">
              <p>
                <strong>结果:</strong>{" "}
                {typeof mainThreadResult === "object" && mainThreadResult.primes
                  ? `找到 ${mainThreadResult.count} 个素数`
                  : typeof mainThreadResult === "number"
                  ? mainThreadResult.toFixed(6)
                  : JSON.stringify(mainThreadResult)}
              </p>
              <p>
                <strong>耗时:</strong> {mainThreadTime.toFixed(2)}ms
              </p>
              <p style={{ color: "#d32f2f", fontWeight: "bold" }}>
                <strong>体验:</strong>{" "}
                刚才整个页面是不是完全卡死了？这就是主线程阻塞！
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
