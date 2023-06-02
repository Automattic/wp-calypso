import {
	isRequestingWordAdsApproval,
	isRequestingWordAdsApprovalForSite,
	getWordAdsError,
	getWordAdsErrorForSite,
	getWordAdsSuccess,
	getWordAdsSuccessForSite,
} from '../selectors';

describe( 'selectors', () => {
	describe( '#isRequestingWordAdsApproval()', () => {
		test( 'should return requesting site ID', () => {
			const state = {
				wordads: {
					approve: {
						requesting: {
							2916284: true,
							77203074: false,
						},
					},
				},
			};
			expect( isRequestingWordAdsApproval( state, 2916284 ) ).toEqual( true );
			expect( isRequestingWordAdsApproval( state, 77203074 ) ).toEqual( false );
			expect( isRequestingWordAdsApproval( state, 'unknown' ) ).toEqual( false );
		} );
	} );
	describe( '#isRequestingWordAdsApprovalForSite()', () => {
		test( 'should return requesting site ID', () => {
			const state = {
				wordads: {
					approve: {
						requesting: {
							2916284: true,
							77203074: false,
						},
					},
				},
			};
			expect( isRequestingWordAdsApprovalForSite( state, { ID: 2916284 } ) ).toEqual( true );
			expect( isRequestingWordAdsApprovalForSite( state, { ID: 77203074 } ) ).toEqual( false );
			expect( isRequestingWordAdsApprovalForSite( state, null ) ).toEqual( false );
		} );
	} );
	describe( '#getWordAdsError()', () => {
		test( 'should return word ads error', () => {
			const state = {
				wordads: {
					approve: {
						requestErrors: {
							2916284: null,
							77203074: 'Something unexpected happened',
						},
					},
				},
			};
			expect( getWordAdsError( state, 2916284 ) ).toBeNull();
			expect( getWordAdsError( state, 77203074 ) ).toEqual( 'Something unexpected happened' );
		} );
	} );
	describe( '#getWordAdsErrorForSite()', () => {
		test( 'should return word ads error', () => {
			const state = {
				wordads: {
					approve: {
						requestErrors: {
							2916284: null,
							77203074: 'Something unexpected happened',
						},
					},
				},
			};
			expect( getWordAdsErrorForSite( state, { ID: 2916284 } ) ).toBeNull();
			expect( getWordAdsErrorForSite( state, { ID: 77203074 } ) ).toEqual(
				'Something unexpected happened'
			);
			expect( getWordAdsErrorForSite( state, null ) ).toBeNull();
		} );
	} );
	describe( '#getWordAdsSuccess()', () => {
		test( 'should return word ads error', () => {
			const state = {
				wordads: {
					approve: {
						requestSuccess: {
							2916284: null,
							77203074: true,
						},
					},
				},
			};
			expect( getWordAdsSuccess( state, 2916284 ) ).toBeNull();
			expect( getWordAdsSuccess( state, 77203074 ) ).toEqual( true );
		} );
	} );
	describe( '#getWordAdsSuccessForSite()', () => {
		test( 'should return word ads error', () => {
			const state = {
				wordads: {
					approve: {
						requestSuccess: {
							2916284: null,
							77203074: true,
						},
					},
				},
			};
			expect( getWordAdsSuccessForSite( state, { ID: 2916284 } ) ).toBeNull();
			expect( getWordAdsSuccessForSite( state, { ID: 77203074 } ) ).toEqual( true );
			expect( getWordAdsSuccessForSite( state, null ) ).toBeNull();
		} );
	} );
} );
