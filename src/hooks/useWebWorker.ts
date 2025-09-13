import { useCallback, useEffect, useRef, useState } from "react";

interface WorkerState {
  isLoading: boolean;
  result: any;
  error: string | null;
  progress: number;
}

export function useWebWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [state, setState] = useState<WorkerState>({
    isLoading: false,
    result: null,
    error: null,
    progress: 0,
  });

  // 初始化 Web Worker
  useEffect(() => {
    // 检查浏览器是否支持 Web Worker
    if (typeof Worker !== "undefined") {
      workerRef.current = new Worker(
        new URL("../workers/calculator.worker.ts", import.meta.url),
        { type: "module" }
      );

      workerRef.current.onmessage = (event) => {
        const { type, data, progress } = event.data;

        switch (type) {
          case "RESULT":
            setState((prev) => ({
              ...prev,
              isLoading: false,
              result: data,
              error: null,
              progress: 100,
            }));
            break;

          case "PROGRESS":
            setState((prev) => ({
              ...prev,
              progress: progress || 0,
            }));
            break;

          case "ERROR":
            setState((prev) => ({
              ...prev,
              isLoading: false,
              error: data.error,
              progress: 0,
            }));
            break;
        }
      };

      workerRef.current.onerror = (error) => {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message,
          progress: 0,
        }));
      };
    } else {
      setState((prev) => ({
        ...prev,
        error: "您的浏览器不支持 Web Worker",
      }));
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // 发送消息到 Worker
  const postMessage = useCallback((type: string, data: any) => {
    if (workerRef.current) {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        result: null,
        error: null,
        progress: 0,
      }));

      workerRef.current.postMessage({ type, data });
    }
  }, []);

  // 重置状态
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      result: null,
      error: null,
      progress: 0,
    });
  }, []);

  return {
    ...state,
    postMessage,
    reset,
    isSupported: typeof Worker !== "undefined",
  };
}
