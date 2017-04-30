/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	getHelpSelectedSiteId,
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getHelpSelectedSiteId()', () => {
		it( 'should return null for default state', () => {
			const state = deepFreeze( {
				help: {
					selectedSiteId: null
				}
			} );

			expect( getHelpSelectedSiteId( state ) ).to.be.null;
		} );

		it( 'should return courses for given state', () => {
			const state = deepFreeze( {
				help: {
					selectedSiteId: 1234
				}
			} );

			expect( getHelpSelectedSiteId( state ) ).to.eql( state.help.selectedSiteId );
		} );
	} );
} );
