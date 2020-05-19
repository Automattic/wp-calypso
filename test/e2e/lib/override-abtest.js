/**
 * External dependencies
 */
import { isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import * as abTests from '../../../client/lib/abtest/active-tests';
import * as slackNotifier from './slack-notifier';

async function writeABTests( driver, testList ) {
	await driver.executeScript( 'window.localStorage.clear();' );

	await driver.executeScript( `window.localStorage.setItem('ABTests','{${ testList }}');` );

	const abtestsValue = await driver.executeScript( 'return window.localStorage.ABTests;' );
	if ( ! isEqual( JSON.parse( abtestsValue ), JSON.parse( `{${ testList }}` ) ) ) {
		const message = `The localstorage value for AB tests wasn't set correctly.\nExpected value is:\n'{${ testList }}'\nActual value is:\n'${ abtestsValue }'`;
		slackNotifier.warn( message, { suppressDuplicateMessages: true } );
	}
}

/**
 * Overrides an A/B Test.
 *
 * @param {Browser} driver Webdriver browser instance
 * @param {string} name A/B test name
 * @param {string} variation the variation you want to set
 * @returns {Function} undo the changes.
 */
export async function setOverriddenABTests( driver, name, variation ) {
	const abTestList = abTests.default;
	const expectedABTestValue = Object.keys( abTestList ).map( ( test ) => {
		if ( test === name ) {
			return `"${ test }_${ abTestList[ test ].datestamp }":"${ variation }"`;
		}
		return `"${ test }_${ abTestList[ test ].datestamp }":"${ abTestList[ test ].defaultVariation }"`;
	} );
	return await writeABTests( driver, expectedABTestValue );
}

export async function checkForUnknownABTestKeys( driver ) {
	const knownABTestKeys = Object.keys( abTests.default );

	return await driver
		.executeScript( 'return window.localStorage.ABTests;' )
		.then( ( abtestsValue ) => {
			for ( const key in JSON.parse( abtestsValue ) ) {
				const testName = key.split( '_' )[ 0 ];
				if ( knownABTestKeys.indexOf( testName ) < 0 ) {
					const message = `Found an AB Testing key in local storage that isn't known: '${ testName }'. This may cause inconsistent A/B test behaviour, please check this is okay and add it to 'knownABTestKeys' in default.config`;
					slackNotifier.warn( message, { suppressDuplicateMessages: true } );
				}
			}
		} );
}

export async function setABTestControlGroups( driver, { reset = false } = {} ) {
	const abTestList = abTests.default;
	let updateTests = true;

	await driver.executeScript( 'return window.localStorage.ABTests;' ).then( ( abtestsValue ) => {
		const storedValueCount = abtestsValue ? Object.keys( JSON.parse( abtestsValue ) ).length : 0;
		const abTestCount = Object.keys( abTestList ).length;
		if ( storedValueCount === abTestCount && reset === false ) {
			updateTests = false;
		}
	} );

	if ( updateTests === true ) {
		const expectedABTestValue = Object.keys( abTestList ).map(
			( test ) =>
				`"${ test }_${ abTestList[ test ].datestamp }":"${ abTestList[ test ].defaultVariation }"`
		);

		return await writeABTests( driver, expectedABTestValue );
	}
}
