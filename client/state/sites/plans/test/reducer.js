/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	FETCH_SITE_PLANS,
	REMOVE_SITE_PLANS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import { initialSiteState, plans } from '../reducer';

describe( 'reducer', () => {
	describe( '#plans()', () => {
		it( 'should default to an empty object', () => {
			const state = plans( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should index plans by site ID', () => {
			const siteId = 11111111,
				state = plans( undefined, {
					type: FETCH_SITE_PLANS,
					siteId: siteId
				} );

			expect( state ).to.eql( {
				[ siteId ]: Object.assign( {}, initialSiteState, { isFetching: true } )
			} );
		} );

		it( 'should accumulate plans for different sites', () => {
			const original = Object.freeze( {
					11111111: initialSiteState
				} ),
				state = plans( original, {
					type: FETCH_SITE_PLANS,
					siteId: 55555555
				} );

			expect( state ).to.eql( {
				11111111: initialSiteState,
				55555555: Object.assign( {}, initialSiteState, { isFetching: true } )
			} );
		} );

		it( 'should override previous plans of same site ID', () => {
			const original = Object.freeze( {
					11111111: initialSiteState
				} ),
				state = plans( original, {
					type: FETCH_SITE_PLANS,
					siteId: 11111111
				} );

			expect( state ).to.eql( {
				11111111: Object.assign( {}, initialSiteState, { isFetching: true } )
			} );
		} );

		it( 'should remove plans for a given site ID', () => {
			const original = Object.freeze( {
					11111111: initialSiteState,
					22222222: initialSiteState
				} ),
				state = plans( original, {
					type: REMOVE_SITE_PLANS,
					siteId: 11111111
				} );

			expect( state ).to.eql( {
				22222222: initialSiteState
			} );
		} );

		it( 'never persists state because this is not implemented', () => {
			const original = Object.freeze( {
				11111111: initialSiteState,
				22222222: initialSiteState
			} );
			const state = plans( original, { type: SERIALIZE } );
			expect( state ).to.eql( {} );
		} );

		it( 'never loads persisted state because this is not implemented', () => {
			const original = Object.freeze( {
				11111111: initialSiteState,
				22222222: initialSiteState
			} );
			const state = plans( original, { type: DESERIALIZE } );
			expect( state ).to.eql( {} );
		} );
	} );
} );
