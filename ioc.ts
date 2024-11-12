class CreateIoc {
  public container: Map<symbol, { callback: Function }>;
  constructor() {
    this.container = new Map();
  }

  get(namespace: symbol) {
    const item = this.container.get(namespace);
    if (item) {
      return item.callback();
    } else {
      throw new Error("暂未找到实例");
    }
  }

  bind(key: symbol, callback: Function) {
    this.container.set(key, {
      callback,
    });
  }
}

export default CreateIoc;
