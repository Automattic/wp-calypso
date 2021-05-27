/* eslint-disable mocha/no-top-level-hooks */
/**
 * Internal dependencies
 */
import {
	// clearFailedTest,
	closeBrowser,
	closePage,
	// recordFailedTestName,
	startBrowser,
	saveScreenshot,
	// saveVideo,
} from '@automattic/calypso-e2e';

beforeAll( async function () {
	await startBrowser(), 60000;
} );
afterEach( async function () {
	await saveScreenshot(), 60000;
} );
afterAll( async function () {
	await closePage(), 60000;
} );
afterAll( async function () {
	await closeBrowser(), 60000;
} );
// afterEach( saveScreenshot, recordFailedTestName );
// afterAll( closePage, saveVideo, closeBrowser );
