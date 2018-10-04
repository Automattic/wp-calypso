/** @format */

/**
 * External dependencies
 */

import ReactDom from 'react-dom';
import React from 'react';
import Debug from 'debug';
/**
 * Internal dependencies
 */
import TestList from './TestList';
import { getAllTests } from 'lib/abtest';
import { ABTEST_LOCALSTORAGE_KEY } from 'lib/abtest/utility';

const debug = Debug( 'calypso:abtests:helper' );

export default function injectTestHelper( element ) {
	ReactDom.render(
		React.createElement( TestList, {
			tests: getAllTests(),
			onChangeVariant: function( test, variation ) {
				const testSettings = JSON.parse( localStorage.getItem( ABTEST_LOCALSTORAGE_KEY ) ) || {};
				testSettings[ test.experimentId ] = variation;
				debug( 'Switching test variant', test.experimentId, variation );
				localStorage.setItem( ABTEST_LOCALSTORAGE_KEY, JSON.stringify( testSettings ) );
				window.location.reload();
			},
		} ),
		element
	);
}
