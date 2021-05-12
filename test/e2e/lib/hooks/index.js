/**
 * Internal dependencies
 */
import { startVideo, stopVideo, takeScreenshot } from './video-recorder';

export const mochaHooks = {
	afterAll: [ stopVideo ],
	beforeAll: [ startVideo ],
	afterEach: [ takeScreenshot ],
};
