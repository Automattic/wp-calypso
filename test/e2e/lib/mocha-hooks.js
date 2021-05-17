/* eslint-disable mocha/no-top-level-hooks */

/**
 * External dependencies
 */
import config from 'config';
import assert from 'assert';

/**
 * Internal dependencies
 */
import * as driverManager from './driver-manager';

const afterHookTimeoutMS = config.get( 'afterHookTimeoutMS' );

before( function () {
	if ( process.env.LIVEBRANCHES === 'true' ) {
		const isCalypsoLiveURL = config.get( 'calypsoBaseURL' ).includes( 'calypso.live' );
		assert.strictEqual( isCalypsoLiveURL, true );
	}
} );

// Sauce Breakpoint
afterEach( function () {
	const driver = global.__BROWSER__;

	if (
		process.env.SAUCEDEBUG &&
		this.currentTest.state === 'failed' &&
		config.has( 'sauce' ) &&
		config.get( 'sauce' )
	) {
		driver.executeScript( 'sauce: break' );
	}
} );

// Dismiss any alerts for switching away
afterEach( async function () {
	await this.timeout( afterHookTimeoutMS );
	const driver = global.__BROWSER__;

	if (
		this.currentTest &&
		this.currentTest.state === 'failed' &&
		( config.get( 'closeBrowserOnComplete' ) === true || global.isHeadless === true )
	) {
		await driverManager.acceptAllAlerts( driver );
	}
} );

// Update Sauce Job Status locally
afterEach( function () {
	const driver = global.__BROWSER__;

	if ( config.has( 'sauce' ) && config.get( 'sauce' ) ) {
		driver.allPassed = driver.allPassed && this.currentTest.state === 'passed';
	}
} );

// Push SauceLabs job status update (if applicable)
after( async function () {
	await this.timeout( afterHookTimeoutMS );
	const driver = global.__BROWSER__;

	if ( config.has( 'sauce' ) && config.get( 'sauce' ) ) {
		await driver.executeScript( 'sauce:job-result=' + driver.allPassed );
	}
} );
