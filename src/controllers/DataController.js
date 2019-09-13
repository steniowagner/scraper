const { QueryTypes } = require('sequelize');

const { iptu } = require('../models');
const db = require('../models');

const PAGE_SIZE = 30;

exports.load = async items => {
  try {
    return Promise.all(items.map(async item => iptu.create(item)));
  } catch (err) {
    console.log(err);
  }
};

exports.edit = async iptuUpdated => {
  try {
    return await db.sequelize.query(
      `UPDATE iptu SET zona = '${iptuUpdated.zona}' WHERE sampleid = ${iptuUpdated.sampleid}`,
      {
        type: QueryTypes.UPDATE,
        raw: true,
      }
    );
  } catch (err) {
    console.log(err);
  }
};

exports.read = async currentPage => {
  try {
    const offset = currentPage * PAGE_SIZE;
    const limit = PAGE_SIZE;

    return await db.sequelize.query(
      `SELECT * FROM iptu WHERE zona = 'PA' OR zona IS null ORDER BY zona ASC LIMIT ${limit} OFFSET ${offset}`,
      {
        type: QueryTypes.SELECT,
        raw: true,
      }
    );
  } catch (err) {
    console.log('errr, ', err);
    return [];
  }
};

exports.readAll = async () => {
  try {
    return await db.sequelize.query('SELECT * FROM iptu', {
      type: QueryTypes.SELECT,
      raw: true,
    });
  } catch (err) {
    console.log(err);
  }
};
