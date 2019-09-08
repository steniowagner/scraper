const { Op } = require('sequelize');
const { iptu } = require('../models');

const PAGE_SIZE = 50;

const paginate = page => ({
  offset: page * PAGE_SIZE,
  limit: PAGE_SIZE,
});

exports.load = async items => {
  try {
    return Promise.all(items.map(async item => iptu.create(item)));
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

exports.read = async currentPage => {
  try {
    return await iptu.findAll({
      raw: true,
      ...paginate(currentPage),
      where: {
        zona: {
          [Op.eq]: null,
        },
      },
    });
  } catch (err) {
    return [];
  }
};

exports.readAll = async () => {
  try {
    return await iptu.findAll({ raw: true });
  } catch (err) {
    console.log(err);
  }
};
