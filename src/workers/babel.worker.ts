import * as Babel from "@babel/standalone";

// 配置 Babel 预设
Babel.registerPreset("tsx-preset", {
  presets: [
    [
      "env",
      {
        targets: {
          browsers: ["> 1%", "last 2 versions"],
        },
      },
    ],
    "react",
    "typescript",
  ],
  plugins: ["syntax-jsx", "transform-react-jsx"],
});

interface BabelMessage {
  type: "COMPILE_TSX" | "COMPILE_JS" | "VALIDATE_SYNTAX";
  data: {
    code: string;
    filename?: string;
    presets?: string[];
    plugins?: string[];
  };
}

interface BabelResult {
  type: "RESULT" | "ERROR" | "PROGRESS";
  data: any;
  progress?: number;
}

// 编译 TSX/JSX 代码
function compileTSX(code: string, filename: string = "component.tsx"): any {
  try {
    const result = Babel.transform(code, {
      presets: ["react", "typescript"],
      plugins: [["transform-react-jsx", { runtime: "automatic" }]],
      filename,
      sourceMaps: true,
    });

    return {
      code: result.code,
      map: result.map,
      ast: result.ast,
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      loc: (error as any)?.loc,
    };
  }
}

// 编译普通 JavaScript
function compileJS(code: string, filename: string = "script.js"): any {
  try {
    const result = Babel.transform(code, {
      presets: ["env"],
      filename,
      sourceMaps: true,
    });

    return {
      code: result.code,
      map: result.map,
      ast: result.ast,
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      loc: (error as any)?.loc,
    };
  }
}

// 验证语法
function validateSyntax(code: string): any {
  try {
    // 使用 transform 来验证语法，如果语法错误会抛出异常
    Babel.transform(code, {
      presets: ["react", "typescript"],
      plugins: [["transform-react-jsx", { runtime: "automatic" }]],
      code: false, // 只做语法检查，不生成代码
    });

    return {
      valid: true,
      message: "语法正确",
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : String(error),
      loc: (error as any)?.loc,
    };
  }
}

// 监听主线程消息
self.addEventListener("message", (event: MessageEvent<BabelMessage>) => {
  const { type, data } = event.data;

  try {
    switch (type) {
      case "COMPILE_TSX": {
        const { code, filename } = data;
        // 发送进度更新
        self.postMessage({
          type: "PROGRESS",
          progress: 30,
          data: { message: "开始编译 TSX..." },
        } as BabelResult);

        const result = compileTSX(code, filename);

        self.postMessage({
          type: "PROGRESS",
          progress: 80,
          data: { message: "编译完成，生成源码映射..." },
        } as BabelResult);

        self.postMessage({
          type: "RESULT",
          data: {
            ...result,
            type: "TSX_COMPILATION",
            originalCode: code,
            filename,
          },
        } as BabelResult);
        break;
      }

      case "COMPILE_JS": {
        const { code, filename } = data;
        self.postMessage({
          type: "PROGRESS",
          progress: 30,
          data: { message: "开始编译 JavaScript..." },
        } as BabelResult);

        const result = compileJS(code, filename);

        self.postMessage({
          type: "RESULT",
          data: {
            ...result,
            type: "JS_COMPILATION",
            originalCode: code,
            filename,
          },
        } as BabelResult);
        break;
      }

      case "VALIDATE_SYNTAX": {
        const { code } = data;
        const result = validateSyntax(code);

        self.postMessage({
          type: "RESULT",
          data: {
            ...result,
            type: "SYNTAX_VALIDATION",
            originalCode: code,
          },
        } as BabelResult);
        break;
      }
    }
  } catch (error) {
    self.postMessage({
      type: "ERROR",
      data: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    } as BabelResult);
  }
});

// 导出空对象以使 TypeScript 识别这是一个模块
export {};
