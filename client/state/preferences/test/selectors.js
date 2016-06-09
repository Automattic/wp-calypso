/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	fetchingPreferences,
	getPreference,
} from '../selectors';

describe( 'selectors', () => {
	describe( '#fetchingPreferences()', () => {
		it( 'should return preferences fetching status', () => {
			const state = {	preferences: { fetching: true } };
			expect( fetchingPreferences( state ) ).to.equal( true );
		} );
	} );
	describe( '#getPreference()', () => {
		it( 'should return preference value', () => {
			const state = {	preferences: { values: {
				one: 1,
				two: 2
			} } };
			expect( getPreference( state, 'one' ) ).to.equal( 1 );
			expect( getPreference( state, 'two' ) ).to.equal( 2 );
			expect( getPreference( state, 'three' ) ).to.be.undefined;
		} );
	} );
} );
