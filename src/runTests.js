const ScrapingController = require('./controllers/ScrapingController');
const DataController = require('./controllers/DataController');

process.setMaxListeners(Infinity);

const pendingTasks = [];
const results = [];

let currentPage = 0;

const runTask = async iptus => {
  console.log('>> Start Scraping');
  return Promise.all(
    await iptus.map(async iptu => {
      try {
        const zone = await ScrapingController.startScraping(
          iptu.numero_contribuinte
        );
        console.log(
          '>> Scraping Finished for item with sampleid: ',
          iptu.sampleid
        );
        results.push({
          item: iptu.sampleid,
          expected: zone,
          found: iptu.zona,
          isCorrect: iptu.zona === zone,
        });
      } catch (err) {
        pendingTasks.push(iptu);
        console.log('>> Error Found with the Item: ', iptu.sampleid);
        console.log(
          '>> Pending Tasks: ',
          pendingTasks.map(pendingTask => pendingTask.sampleid)
        );
      }
    })
  );
};

function* startTasks(iptus) {
  console.log('>> Current Page: ', currentPage);
  console.log('>> Current Items: ', iptus.map(iptu => iptu.sampleid));

  while (iptus.length) {
    console.log('>> Starting Tasks');
    yield runTask(iptus);
  }
}

const runTests = async generatorRunner => {
  const run = async () => {
    let dataset = [];

    dataset =
      pendingTasks.length > 0
        ? pendingTasks.splice(0)
        : await DataController.read(currentPage);

    const generator = generatorRunner(dataset);

    const next = generator.next();

    if (!dataset.length) {
      console.log(
        "There's items with problems?",
        results.some(result => !result.isCorrect)
      );
      console.log(
        'Items with wrong zone: ',
        results.filter(result => !result.isCorrect)
      );
    }

    if (!next.done) {
      next.value.then(() => {
        if (!pendingTasks.length) {
          currentPage += 1;
        }
        run();
      });
    }
  };

  await run();
};

runTests(startTasks);
