const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const data = require('../data.js');

const BASE_URL =
  'http://geosampa.prefeitura.sp.gov.br/PaginasPublicas/Report/ConsultaZoneamento/ConsultaZoneamento.aspx?SQLzoneamento';

const getScrapedHTMLData = async url => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url);
    await page.waitFor(1000 * 5);
    const content = await page.content();
    await browser.close();

    return content;
  } catch (err) {
    console.log(err);
  }
};

const parseData = pageBody => {
  let $ = cheerio.load(pageBody);
  const data = [];

  const mainTableContent = $(
    '#VisibleReportContentrpvRelatorio_ctl09 div table tbody tr td table tbody'
  )
    .children('tr')
    .eq(1)
    .html();

  $ = cheerio.load(mainTableContent);

  const getZoneData = targetContent => {
    let rowData = {};

    for (let i = 3; i < 6; i++) {
      const outterContent = $(targetContent)
        .children('tr')
        .eq(i);

      for (let j = 1; j < 5; j++) {
        const innerContent = $(outterContent)
          .children('td')
          .eq(j)
          .text();

        if (j === 1) {
          rowData.sigla = innerContent;
        }

        if (j === 2) {
          rowData.descricao = innerContent;
        }

        if (j === 3) {
          rowData.perimetro = innerContent;
        }

        if (j === 4) {
          rowData.legislacao = innerContent;
        }
      }

      data.push(rowData);

      rowData = {};
    }
  };

  const targetContent = $('td table tbody tr td table tbody');

  getZoneData(targetContent);

  return data;
};

const startScraping = async url => {
  try {
    const html = await getScrapedHTMLData(url);
    const data = parseData(html);

    return data;
  } catch (err) {
    console.log(err);
  }
};

const getRequestParams = iptu => {
  const data = iptu.split('-')[0];

  const sector = data.slice(0, 3);
  const block = data.slice(3, 6);
  const lot = data.slice(6);

  return [sector, block, lot];
};

const getResults = async () => {
  const results = await Promise.all(
    data.slice(0, 3).map(async item => {
      const { numero_contribuinte } = item;
      const [sector, block, lot] = getRequestParams(numero_contribuinte);
      const url = `${BASE_URL}=${sector}-${block}-${lot}`;

      const zoneData = await startScraping(url);

      return {
        ...item,
        zone_id: zoneData,
      };
    })
  );

  console.log(results);
};

getResults();
