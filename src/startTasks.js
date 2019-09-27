const { performance } = require('perf_hooks');

const ScrapingController = require('./controllers/ScrapingController');
const DataController = require('./controllers/DataController');
const sendEmails = require('./controllers/MailController');

process.setMaxListeners(Infinity);

const pendingTasks = [];
let currentPage = 0;

let endTime = 0;
let startTime = 0;

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

        return DataController.edit({
          ...iptu,
          zona: zone,
        });
      } catch (err) {
        if (err.message !== 'Invalid Input') {
          pendingTasks.push(iptu);
          console.log('>> Error Found with the Item: ', iptu.sampleid);
          console.log(
            '>> Pending Tasks: ',
            pendingTasks.map(pendingTask => pendingTask.sampleid)
          );
        }
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

const runner = async generatorRunner => {
  const run = async () => {
    try {
      let dataset = [];

      dataset =
        pendingTasks.length > 0
          ? pendingTasks.splice(0)
          : await DataController.read(currentPage);

      const generator = generatorRunner(dataset);

      const next = generator.next();

      if (!dataset.length) {
        endTime = performance.now();
        const total = endTime - startTime;
        console.log('Total time: ', total, 'ms => ', total / 1000, 's');
      }

      if (!next.done) {
        next.value.then(() => {
          if (!pendingTasks.length) {
            currentPage += 1;
          }
          run();
        });
      } else {
        sendEmails();
      }
    } catch (err) {
      sendEmails('SCRIPT ERROR', err.message);
    }
  };

  await run();
};

startTime = performance.now();

runner(startTasks);
