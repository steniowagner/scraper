const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const BASE_URL =
  'http://geosampa.prefeitura.sp.gov.br/PaginasPublicas/Report/ConsultaZoneamento/ConsultaZoneamento.aspx?SQLzoneamento';

const DEFAULT_ERRROR_MESSAGE =
  'Object reference not set to an instance of an object.';

const getScrapedHTMLData = async url => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    await page.setDefaultNavigationTimeout(0);
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

  const labelMessage = $('#lblMensagem').text();

  if (labelMessage === DEFAULT_ERRROR_MESSAGE) {
    throw new Error('Invalid Input');
  }

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
  const html = await getScrapedHTMLData(url);
  const data = parseData(html);

  return data;
};

const getRequestParams = iptu => {
  const data = iptu.split('-')[0];

  const sector = data.slice(0, 3);
  const block = data.slice(3, 6);
  const lot = data.slice(6);

  return [sector, block, lot];
};

exports.startScraping = async numero_contribuinte => {
  try {
    const [sector, block, lot] = getRequestParams(numero_contribuinte);
    const url = `${BASE_URL}=${sector}-${block}-${lot}`;

    const zoneData = await startScraping(url);

    return zoneData[0].sigla;
  } catch (err) {
    console.log('122', err.message);
    throw err;
  }
};
