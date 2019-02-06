/** @format */

import config from 'config';
import { findIndex } from 'lodash';

function getABTestEraser( name ) {
	return () => {
		const overrideABTests = config.get( 'overrideABTests' );
		const index = findIndex( overrideABTests, item => item[ 0 ] === name );

		if ( index !== -1 ) {
			overrideABTests.splice( index, 1 );
		}
	};
}

function getABTestUpdater( name, variation ) {
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
export default function overrideABTest( name, variation ) {
	const overrideABTests = config.get( 'overrideABTests' );
	const index = findIndex( overrideABTests, item => item[ 0 ] === name );

	if ( index !== -1 ) {
		const originalVariation = overrideABTests[ index ][ 1 ];
		overrideABTests[ index ][ 1 ] = variation;
		return getABTestUpdater( name, originalVariation );
	}

	overrideABTests.push( [ name, variation ] );
	return getABTestEraser( name );
}
