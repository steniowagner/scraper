const IptuModel = (sequelize, DataTypes) => {
  const { INTEGER, STRING } = DataTypes;

  const Model = sequelize.define('iptu', {
    sampleid: {
      autoIncrement: true,
      primaryKey: true,
      type: INTEGER,
    },
    numero_contribuinte: STRING,
    nome_contribuinte: STRING,
    nome_logradouro: STRING,
    area_construida: STRING,
    tipo_terreno: STRING,
    area_terreno: STRING,
    complemento: STRING,
    tipo_uso: STRING,
    numero: STRING,
    bairro: STRING,
    zona: STRING,
    cep: STRING,
  });

  return Model;
};

module.exports = IptuModel;
