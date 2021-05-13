/* global jasmine:false */
/* eslint-disable mocha/no-top-level-hooks */
/**
 * External dependencies
 */
import config from 'config';
import * as failFast from 'jasmine-fail-fast';
import * as driverManager from './lib/driver-manager';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const afterHookTimeoutMS = config.get( 'afterHookTimeoutMS' );

// Default timeout
jest.setTimeout( mochaTimeOut );

// Bail if a test in the suite fails
const jasmineEnv = jasmine.getEnv();
jasmineEnv.addReporter( failFast.init() );

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
