interface IIndexService {
  log(str: string): void;
}

class IndexService implements IIndexService {
  log(str: string): void {
    console.log(str);
  }
}

class IndexController {
  public indexService: IIndexService;
  constructor(indexService: IIndexService) {
    if (indexService) {
      this.indexService = indexService;
    }
  }
  info() {
    this.indexService.log("🍎🍎🍎🍎🍎🍎🍎🍎🍎");
  }
}
const service = new IndexService();
const index = new IndexController(service);

index.info();
