const ScrapingController = require('./controllers/ScrapingController');
const DataController = require('./controllers/DataController');

process.setMaxListeners(Infinity);

const BATCH_SIZE = 5;

const runTask = async iptus => {
  return Promise.all(
    await iptus.map(async iptu => {
      const zone = await ScrapingController.startScraping(iptu);
      return DataController.edit({
        ...iptu,
        zona: zone,
      });
    })
  );
};

const sleep = ms =>
  new Promise(resolve => {
    setTimeout(() => resolve(), ms);
  });

function* startTasks(iptus) {
  while (iptus.length) {
    const items = iptus.splice(0, BATCH_SIZE);

    yield sleep(15000);
    yield runTask(items);
  }
}

const runner = async generatorRunner => {
  const iptus = await DataController.getAll();

  const generator = generatorRunner(iptus);

  const run = () => {
    const next = generator.next();
    if (!next.done) {
      next.value.then(_ => run());
    }
  };

  run();
};

runner(startTasks);
/*
const loadData = async () => {
  await DataController.load();
};

loadData(); */
