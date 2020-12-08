/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { ROUTE_SET, SECTION_SET, SITE_SETTINGS_SAVE } from 'calypso/state/action-types';

describe( 'reducer', () => {
	test( 'should initialize to the first index', () => {
		expect( reducer( undefined, { type: '@@test/INIT' } ) ).to.equal( 0 );
	} );

	test( 'should advance in response to system actions', () => {
		expect( reducer( 11, { type: ROUTE_SET } ) ).to.equal( 12 );
		expect( reducer( 12, { type: SECTION_SET } ) ).to.equal( 13 );
		expect( reducer( 13, { type: SITE_SETTINGS_SAVE } ) ).to.equal( 14 );
	} );

	test( 'should not advance in response to other actions', () => {
		expect( reducer( 2, { type: 'BOGUS_ACTION' } ) ).to.equal( 2 );
	} );
} );
