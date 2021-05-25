/**
 * Internal dependencies
 */
import {
	saveScreenshot,
	saveVideo,
	clearFailedTest,
	recordFailedTestName,
	startBrowser,
	closeBrowser,
	closePage,
} from '@automattic/calypso-e2e';

export const mochaHooks = {
	beforeAll: [ startBrowser, clearFailedTest ],
	afterEach: [ saveScreenshot, recordFailedTestName ],
	afterAll: [ closePage, saveVideo, closeBrowser ],
};
