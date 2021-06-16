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

export const mochaHooks = () => {
	const videoHooks = buildVideoHooks();
	const browserHooks = buildBrowserHooks();

	const createBrowserHook = async function () {
		this.timeout( startBrowserTimeoutMS );
		const driver = await browserHooks.createBrowser();
		this.driver = driver;
	};

	return {
		afterAll: [ ...videoHooks.afterAll, browserHooks.saveBrowserLogs, browserHooks.closeBrowser ],
		beforeAll: [ ...videoHooks.beforeAll, createBrowserHook ],
		afterEach: [ ...videoHooks.afterEach ],
	};
};
