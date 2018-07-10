/**
 * External dependencies
 */
import puppeteer from 'puppeteer';

const { PUPPETEER_HEADLESS, PUPPETEER_SLOWMO } = process.env;

// The Jest timeout is increased because these tests are a bit slow
jest.setTimeout( 100000 );

beforeAll( async () => {
	global.browser = await puppeteer.launch( {
		headless: PUPPETEER_HEADLESS !== 'false',
		slowMo: parseInt( PUPPETEER_SLOWMO, 10 ) || 0,
	} );
} );

afterAll( async () => {
	await browser.close();
} );
