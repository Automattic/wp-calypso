/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { error } from '../actions';

describe( 'reducer', () => {
	it( 'should initialize to an empty object', () => {
		expect( reducer( undefined, { type: '@@UNKNOWN_ACTION' } ) ).to.eql( {} );
	} );

	it( 'should create a site object when an action for that site occurrs.', () => {
		const siteId = 123;
		const dummyAction = { type: 'WOOCOMMERCE_DUMMY_ACTION' };
		const state = reducer( undefined, error( siteId, dummyAction, { code: 404, message: 'not found' } ) );

		expect( state[ siteId ] ).to.exist;
	} );
} );

