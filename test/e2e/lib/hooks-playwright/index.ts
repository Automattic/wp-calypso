/**
 * Internal dependencies
 */
import {
	saveScreenshot,
	saveVideo,
	clearFailedTest,
	recordFailedTestName,
} from '@automattic/calypso-e2e';

export const mochaHooks = {
	beforeAll: [ clearFailedTest ],
	afterEach: [ saveScreenshot, recordFailedTestName ],
	afterAll: [ saveVideo ],
};
