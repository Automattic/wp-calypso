/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingWordAdsApproval,
	isRequestingWordAdsApprovalForSite,
	getWordAdsError,
	getWordAdsErrorForSite
} from '../selectors';

describe( 'selectors', () => {
	describe( '#isRequestingWordAdsApproval()', () => {
		it( 'should return requesting site ID', () => {
			const state = {
				wordads: {
					approve: {
						requesting: {
							2916284: true,
							77203074: false
						}
					}
				}
			};
			expect( isRequestingWordAdsApproval( state, 2916284 ) ).to.equal( true );
			expect( isRequestingWordAdsApproval( state, 77203074 ) ).to.equal( false );
			expect( isRequestingWordAdsApproval( state, 'unknown' ) ).to.equal( false );
		} );
	} );
	describe( '#isRequestingWordAdsApprovalForSite()', () => {
		it( 'should return requesting site ID', () => {
			const state = {
				wordads: {
					approve: {
						requesting: {
							2916284: true,
							77203074: false
						}
					}
				}
			};
			expect( isRequestingWordAdsApprovalForSite( state, { ID: 2916284 } ) ).to.equal( true );
			expect( isRequestingWordAdsApprovalForSite( state, { ID: 77203074 } ) ).to.equal( false );
			expect( isRequestingWordAdsApprovalForSite( state, null ) ).to.equal( false );
		} );
	} );
	describe( '#getWordAdsError()', () => {
		it( 'should return word ads error', () => {
			const state = {
				wordads: {
					approve: {
						requestErrors: {
							2916284: null,
							77203074: 'Something unexpected happened'
						}
					}
				}
			};
			expect( getWordAdsError( state, 2916284 ) ).to.equal( null );
			expect( getWordAdsError( state, 77203074 ) ).to.equal( 'Something unexpected happened' );
		} );
	} );
	describe( '#getWordAdsErrorForSite()', () => {
		it( 'should return word ads error', () => {
			const state = {
				wordads: {
					approve: {
						requestErrors: {
							2916284: null,
							77203074: 'Something unexpected happened'
						}
					}
				}
			};
			expect( getWordAdsErrorForSite( state, { ID: 2916284 } ) ).to.equal( null );
			expect( getWordAdsErrorForSite( state, { ID: 77203074 } ) ).to.equal( 'Something unexpected happened' );
			expect( getWordAdsErrorForSite( state, null ) ).to.equal( null );
		} );
	} );
} );
