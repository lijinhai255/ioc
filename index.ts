import { Parser } from "acorn";
import { simple } from "acorn-walk";
import CreateIoc from "./ioc";
import "reflect-metadata";

interface IIndexService {
  log(str: string): void;
}
class IndexService implements IIndexService {
  log(str: string) {
    console.log(str);
  }
}
const TYPES = {
  indexService: Symbol.for("indexService"),
};
const container = new CreateIoc();
container.bind(TYPES.indexService, () => new IndexService());

function extractConstructorParams(classCode: Function) {
  try {
    // 使用 acorn 解析代码得到 AST
    const ast = Parser.parse(classCode.toString(), {
      ecmaVersion: 2022, // 使用新版本以支持类字段语法
      sourceType: "module",
    });

    const constructorParams: string[] = [];
    simple(ast, {
      MethodDefinition(node) {
        if (node.kind === "constructor") {
          node.value.params.forEach((param) => {
            if (param.type === "Identifier") {
              constructorParams.push(param.name);
            } else if (
              param.type === "AssignmentPattern" &&
              param.left.type === "Identifier"
            ) {
              constructorParams.push(param.left.name);
            }
          });
        }
      },
    });

    return constructorParams;
  } catch (error) {
    console.error("解析错误:", error);
    return [];
  }
}

function haskey<O extends Object>(obj: O, key: PropertyKey): key is keyof O {
  return obj.hasOwnProperty(key);
}

function inject(serviceIdentifier: symbol) {
  return (target: Object, targetKey: string | undefined, index: number) => {
    console.log("🐻", target, targetKey, index);
    if (!targetKey) {
      Reflect.defineMetadata(
        serviceIdentifier,
        container.get(serviceIdentifier),
        target
      );
    }
  };
}

function controller<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    constructor(...args: any[]) {
      super();
      const _parmas = extractConstructorParams(constructor);
      console.log("_parmas: ", _parmas);
      let identity: string;
      for (identity of _parmas) {
        if (haskey(this, identity)) {
          //去容器中去拿对应的实例
          //   this[identity] = container.get(TYPES[identity as keyof typeof TYPES]);
          this[identity] = Reflect.getMetadata(
            TYPES[identity as keyof typeof TYPES],
            constructor
          );
        }
      }
      //@ts-ignore
      //this.indexService = new IndexService();
    }
  };
}

@controller
class IndexController {
  public indexService!: IIndexService;
  constructor(@inject(TYPES.indexService) indexService?: IndexService) {
    if (indexService) {
      this.indexService = indexService;
    }
  }
  info() {
    this.indexService.log("京程一灯 🏮" + Math.random());
  }
}
// function IndexController() {
// }
// IndexController.constructor == IndexController

// const service = new IndexService();
// const index = new IndexController(service);
// index.info();

const index = new IndexController("", 2);
index.info();
