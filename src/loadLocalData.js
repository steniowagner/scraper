const DataController = require('./controllers/DataController');
const items = require('../data.js');

const loadData = async () => {
  await DataController.load(items);
};

loadData();
