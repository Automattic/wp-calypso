import config from 'config';
import { devices } from 'playwright';
import { LaunchOptions } from './browser-manager';
import { getVideoDir } from './media-helper';
import type { TargetDevice } from './types';
import type { BrowserContextOptions, ViewportSize, Logger } from 'playwright';

export type LocaleCode = `${ string }${ string }`;

/**
 * Returns the target screen size for tests to run against.
 *
 * If the environment variable BROWSERSIZE is set, this will override all configuration
 * values. Otherwise, the default path contained in the configuration file is returned.
 *
 * @returns {TargetDevice} Target screen size.
 */
export function getTargetDeviceName(): TargetDevice {
	return (
		process.env.TARGET_DEVICE || config.get( 'viewportName' )!
	).toLowerCase() as TargetDevice;
}

/**
 * Returns the locale under test.
 *
 * If the environment variable BROWSERLOCALE is set, this will override all configuration
 * values. Otherwise, the default path contained in the configuration file is returned.
 *
 * @returns {LocaleCode} Target locale code.
 */
export function getLocale(): LocaleCode {
	return ( process.env.LOCALE || config.get( 'locale' )! ).toLowerCase() as LocaleCode;
}

/**
 * Returns launch configuration of a device mapping to the target device.
 *
 * @param {TargetDevice} name Name of the target device.
 * @returns {BrowserContextOptions} Launch configuration of the device.
 */
export function getDevice( name: TargetDevice ): BrowserContextOptions {
	if ( name === 'mobile' ) {
		return devices[ 'Pixel 4a (5G)' ];
	}
	if ( name === 'desktop' ) {
		return devices[ 'Desktop Chrome HiDPI' ];
	}
	throw new Error( 'Unknown target device.' );
}

/**
 * Builds the launch configuration that match the target device.
 *
 * Generated launch configuration will be based on Playwright's pre-defined set of devices,
 * however with certain customizations.
 *
 * @param {string} chromeVersion Chrome version to be used as part of user agent string.
 * @param options Options to pass to `browser.newContext()`.
 * @param {Logger} options.logger Logger sink for Playwright logging.
 * @returns {BrowserContextOptions} Customized launch configuration for the target.
 */
export function getLaunchConfiguration(
	chromeVersion: string,
	{ logger }: LaunchOptions
): BrowserContextOptions {
	const videoDir = getVideoDir();
	const userAgent = `user-agent=Mozilla/5.0 (wp-e2e-tests) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${ chromeVersion } Safari/537.36`;

	// Obtain the target device. Currently supported are devices are listed in types.
	const targetDevice = getTargetDeviceName();
	// Get Playwright's pre-defined device that maps to the target device.
	const config = getDevice( targetDevice );

	// Overwrite predefined user agent string with our custom one.
	config.userAgent = userAgent;
	// Explicitly resize captured video resolution to the viewport size.
	config.recordVideo = { dir: videoDir, size: config.viewport as ViewportSize };
	// Custom logger sink.
	config.logger = {
		isEnabled: ( name ) => name === 'api',
		log: logger,
	};
	return config;
}

/**
 * Returns boolean indicating whether this test run should target a Gutenberg Edge user and site.
 *
 * @returns {boolean} True if should target Gutenberg edge. False otherwise.
 */
export function targetGutenbergEdge(): boolean {
	return !! process.env.GUTENBERG_EDGE;
}
