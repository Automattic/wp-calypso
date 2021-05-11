/**
 * Internal dependencies
 */
import { saveScreenshot } from '@automattic/calypso-e2e';

export const mochaHooks = {
	afterEach: [ saveScreenshot ],
};
