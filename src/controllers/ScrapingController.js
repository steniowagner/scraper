const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const defaultZones = require('../data/zones');

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

const getZoneValue = content => {
  const parsedContent = content
    .trim()
    .split(' ')
    .join('-');

  const isCorrectItemFromTable = defaultZones.some(
    zone => zone === parsedContent
  );

  return isCorrectItemFromTable ? parsedContent : null;
};

const getZoneData = targetContent => {
  const $ = cheerio.load(targetContent);

  let content;
  let i = 3;
  let zone;

  while (!zone && i < 6) {
    content = $(targetContent)
      .children('tr')
      .eq(i)
      .children('td')
      .eq(1)
      .text();

    zone = getZoneValue(content);

    i += 1;
  }

  return zone;
};

const getTargetContent = pageBody => {
  let $ = cheerio.load(pageBody);

  const labelMessage = $('#lblMensagem').text();

  if (labelMessage === DEFAULT_ERRROR_MESSAGE) {
    throw new Error('Invalid Input');
  }

  const mainTableContent = $(
    '#VisibleReportContentrpvRelatorio_ctl09 div table tbody tr td table tbody'
  )
    .children('tr')
    .eq(1)
    .html();

  $ = cheerio.load(mainTableContent);

  const targetContent = $('td table tbody tr td table tbody');

  return targetContent;
};

const runScraper = async url => {
  const html = await getScrapedHTMLData(url);
  const targetContent = getTargetContent(html);

  const zone = getZoneData(targetContent);

  return zone;
};

const getRequestParams = iptu => {
  const data = iptu.split('-')[0];

  const sector = data.slice(0, 3);
  const block = data.slice(3, 6);
  const lot = data.slice(6);

  return [sector, block, lot];
};

exports.startScraping = async numero_contribuinte => {
  const [sector, block, lot] = getRequestParams(numero_contribuinte);
  const url = `${BASE_URL}=${sector}-${block}-${lot}`;

  const zone = await runScraper(url);

  return zone;
};
