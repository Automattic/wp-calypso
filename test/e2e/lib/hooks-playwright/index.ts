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
	createLogDir,
} from '@automattic/calypso-e2e';

export const mochaHooks = {
	beforeAll: [ createLogDir, startBrowser, clearFailedTest ],
	afterEach: [ saveScreenshot, recordFailedTestName ],
	afterAll: [ closePage, saveVideo, closeBrowser ],
};
