/**
 * Internal dependencies
 */
import { startVideoRecording, stopVideoRecording, saveVideoRecording } from './video-recorder';
import { takeScreenshot } from './screenshot';
import { saveBrowserLogs } from './save-browser-logs';

export const mochaHooks = {
	beforeAll: [ startVideoRecording ],
	afterEach: [ takeScreenshot, saveVideoRecording, saveBrowserLogs ],
	afterAll: [ stopVideoRecording ],
};
