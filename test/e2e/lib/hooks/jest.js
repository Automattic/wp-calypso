/* eslint-disable mocha/no-top-level-hooks */
/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import { buildHooks as buildVideoHooks } from './video';
import { buildHooks as buildBrowserHooks } from './browser';

const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

const videoHooks = buildVideoHooks();
const browserHooks = buildBrowserHooks();

for ( const hook of videoHooks.afterAll ) {
	afterAll( hook );
}
for ( const hook of videoHooks.beforeAll ) {
	beforeAll( hook );
}
for ( const hook of videoHooks.afterEach ) {
	afterEach( hook );
}

beforeAll( async () => {
	const driver = await browserHooks.createBrowser();
	global.__BROWSER__ = driver;
}, startBrowserTimeoutMS );

afterAll( browserHooks.saveBrowserLogs );
afterAll( browserHooks.closeBrowser );
