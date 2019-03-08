/** @format */

import config from 'config';
import { findIndex } from 'lodash';

async function getABTestEraser( name ) {
	return () => {
		const overrideABTests = config.get( 'overrideABTests' );
		const index = findIndex( overrideABTests, item => item[ 0 ] === name );

		if ( index !== -1 ) {
			overrideABTests.splice( index, 1 );
		}
	};
}

async function getABTestUpdater( name, variation ) {
	return () => {
		const overrideABTests = config.get( 'overrideABTests' );
		const index = findIndex( overrideABTests, item => item[ 0 ] === name );

		if ( index !== -1 ) {
			overrideABTests[ index ][ 1 ] = variation;
		}
	};
}

/**
 * Overrides an A/B Test.
 * @param {String} name A/B test name
 * @param {String} variation the variation you want to set
 * @return {Function} undo the changes.
 */
export default async function overrideABTest( name, variation ) {
	const overrideABTests = config.get( 'overrideABTests' );
	const index = findIndex( overrideABTests, item => item[ 0 ] === name );

	if ( index !== -1 ) {
		const originalVariation = overrideABTests[ index ][ 1 ];
		overrideABTests[ index ][ 1 ] = variation;
		return await getABTestUpdater( name, originalVariation );
	}

	overrideABTests.push( [ name, variation ] );
	return await getABTestEraser( name );
}
