/**
 * Internal dependencies
 */
import { saveBrowserLogs } from './browser-logs';
import { createBrowser, closeBrowser } from './browser';

export const buildHooks = () => {
	let driver;

	return {
		createBrowser: async function () {
			driver = await createBrowser();
			return driver;
		},
		saveBrowserLogs: function () {
			return saveBrowserLogs( driver );
		},
		closeBrowser: function () {
			return closeBrowser( driver );
		},
	};
};
