/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getHelpSiteId } from '../selectors';

describe( 'selectors', () => {
	describe( '#getHelpSiteId()', () => {
		it( 'should return null for default state', () => {
			const state = deepFreeze( {
				help: {
					selectedSiteId: null,
				},
			} );

			expect( getHelpSiteId( state ) ).to.be.null;
		} );

		it( 'should return courses for given state', () => {
			const state = deepFreeze( {
				help: {
					selectedSiteId: 1234,
				},
			} );

			expect( getHelpSiteId( state ) ).to.eql( state.help.selectedSiteId );
		} );
	} );
} );
