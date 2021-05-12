/* eslint-disable mocha/no-top-level-hooks */
/**
 * External dependencies
 */
import config from 'config';
import * as driverManager from './lib/driver-manager';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const afterHookTimeoutMS = config.get( 'afterHookTimeoutMS' );

// Default timeout
jest.setTimeout( mochaTimeOut );

afterAll( function () {
	if ( ! global.__BROWSER__ ) {
		// Early return if there's no browser, i.e. when all specs were skipped.
		return;
	}
	const driver = global.__BROWSER__;

	if (
		( config.has( 'sauce' ) && config.get( 'sauce' ) ) ||
		config.get( 'closeBrowserOnComplete' ) === true ||
		global.isHeadless === true
	) {
		return driverManager.quitBrowser( driver );
	}
}, afterHookTimeoutMS );
