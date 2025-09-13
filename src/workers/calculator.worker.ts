// Web Worker 用于执行复杂的计算任务
interface CalculationMessage {
  type: "CALCULATE" | "FIBONACCI" | "PRIME_NUMBERS";
  data: {
    start?: number;
    end?: number;
    n?: number;
    iterations?: number;
  };
}

interface CalculationResult {
  type: "RESULT" | "PROGRESS" | "ERROR";
  data: any;
  progress?: number;
}

// 斐波那契数列计算（递归方式，故意设计得耗时）
function fibonacciSlow(n: number): number {
  if (n <= 1) return n;
  return fibonacciSlow(n - 1) + fibonacciSlow(n - 2);
}

// 素数计算
function isPrime(num: number): boolean {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;

  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}

// 查找范围内的素数
function findPrimesInRange(start: number, end: number): number[] {
  const primes: number[] = [];
  const total = end - start + 1;

  for (let i = start; i <= end; i++) {
    if (isPrime(i)) {
      primes.push(i);
    }

    // 每处理100个数字发送一次进度更新
    if ((i - start) % 100 === 0) {
      const progress = ((i - start) / total) * 100;
      self.postMessage({
        type: "PROGRESS",
        progress: Math.round(progress),
      } as CalculationResult);
    }
  }

  return primes;
}

// 密集计算任务
function heavyCalculation(iterations: number): number {
  let result = 0;
  const total = iterations;

  for (let i = 0; i < iterations; i++) {
    result += Math.sqrt(i) * Math.sin(i) * Math.cos(i);

    // 每完成1%发送进度更新
    if (i % Math.floor(total / 100) === 0) {
      const progress = (i / total) * 100;
      self.postMessage({
        type: "PROGRESS",
        progress: Math.round(progress),
      } as CalculationResult);
    }
  }

  return result;
}

// 监听主线程消息
self.addEventListener("message", (event: MessageEvent<CalculationMessage>) => {
  const { type, data } = event.data;

  try {
    switch (type) {
      case "FIBONACCI": {
        const { n } = data;
        if (n !== undefined) {
          const result = fibonacciSlow(n);
          self.postMessage({
            type: "RESULT",
            data: { result, input: n },
          } as CalculationResult);
        }
        break;
      }

      case "PRIME_NUMBERS": {
        const { start, end } = data;
        if (start !== undefined && end !== undefined) {
          const primes = findPrimesInRange(start, end);
          self.postMessage({
            type: "RESULT",
            data: { primes, count: primes.length, range: `${start}-${end}` },
          } as CalculationResult);
        }
        break;
      }

      case "CALCULATE": {
        const { iterations } = data;
        if (iterations !== undefined) {
          const result = heavyCalculation(iterations);
          self.postMessage({
            type: "RESULT",
            data: { result, iterations },
          } as CalculationResult);
        }
        break;
      }
    }
  } catch (error) {
    self.postMessage({
      type: "ERROR",
      data: { error: error instanceof Error ? error.message : String(error) },
    } as CalculationResult);
  }
});

// 导出空对象以使 TypeScript 识别这是一个模块
export {};
