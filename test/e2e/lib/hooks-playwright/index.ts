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
} from '@automattic/calypso-e2e';

export const mochaHooks = {
	beforeAll: [ startBrowser, clearFailedTest ],
	afterEach: [ saveScreenshot, recordFailedTestName ],
	afterAll: [ saveVideo, closeBrowser ],
};
