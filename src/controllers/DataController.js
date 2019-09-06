const { iptu } = require('../models');

const data = require('../../data.js');

exports.load = async () => {
  try {
    return Promise.all(data.map(async item => iptu.create(item)));
  } catch (err) {
    console.log(err);
  }
};

exports.edit = async iptuUpdated => {
  try {
    return await iptu.update(
      {
        ...iptuUpdated,
      },
      {
        where: {
          sampleid: iptuUpdated.sampleid,
        },
      }
    );
  } catch (err) {
    console.log(err);
  }
};

exports.getAll = async () => {
  try {
    return await iptu.findAll({ raw: true });
  } catch (err) {
    return [];
  }
};
