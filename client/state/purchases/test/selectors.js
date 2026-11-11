import {
	getRawByPurchaseId,
	getRawSitePurchases,
	getRawUserPurchases,
	isFetchingSitePurchases,
	isFetchingUserPurchases,
	willAtomicSiteRevertAfterPurchaseDeactivation,
} from '../selectors';

describe( 'selectors', () => {
	describe( 'isFetchingUserPurchases', () => {
		test( 'should return the current state of the user purchases request', () => {
			const state = {
				purchases: {
					data: [],
					error: null,
					isFetchingSitePurchases: false,
					isFetchingUserPurchases: true,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: false,
				},
			};

			expect( isFetchingUserPurchases( state ) ).toBe( true );
		} );
	} );

	describe( 'isFetchingSitePurchases', () => {
		test( 'should return the current state of the site purchases request', () => {
			const state = {
				purchases: {
					data: [],
					error: null,
					isFetchingSitePurchases: true,
					isFetchingUserPurchases: false,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: false,
				},
			};

			expect( isFetchingSitePurchases( state ) ).toBe( true );
		} );
	} );

	describe( 'raw selectors', () => {
		// The Redux fetch thunks store the response body untouched, so ids can still
		// arrive as numeric strings; the raw selectors have to match them anyway.
		const state = {
			currentUser: { id: 123 },
			purchases: {
				data: [
					{ ID: '81414', blog_id: '1234', user_id: '123' },
					{ ID: '82867', blog_id: '1234', user_id: '456' },
					{ ID: '105103', blog_id: '123', user_id: '123' },
				],
				error: null,
				isFetchingSitePurchases: false,
				isFetchingUserPurchases: false,
				hasLoadedSitePurchasesFromServer: true,
				hasLoadedUserPurchasesFromServer: true,
			},
		};

		describe( 'getRawSitePurchases', () => {
			test( 'should return the snake_case purchases of a specific site', () => {
				const result = getRawSitePurchases( state, 1234 );

				expect( result ).toHaveLength( 2 );
				expect( result.map( ( purchase ) => purchase.ID ) ).toEqual( [ 81414, 82867 ] );
				expect( result[ 0 ].blog_id ).toBe( 1234 );
			} );
		} );

		describe( 'getRawUserPurchases', () => {
			test( 'should return the snake_case purchases of the current user', () => {
				const result = getRawUserPurchases( state );

				expect( result.map( ( purchase ) => purchase.ID ) ).toEqual( [ 81414, 105103 ] );
			} );

			test( 'should return null until the user purchases have loaded', () => {
				expect(
					getRawUserPurchases( {
						...state,
						purchases: { ...state.purchases, hasLoadedUserPurchasesFromServer: false },
					} )
				).toBeNull();
			} );
		} );

		describe( 'getRawByPurchaseId', () => {
			test( 'should return a snake_case purchase by its id', () => {
				expect( getRawByPurchaseId( state, 82867 ) ).toMatchObject( {
					ID: 82867,
					blog_id: 1234,
				} );
			} );

			test( 'should return undefined when no purchase matches', () => {
				expect( getRawByPurchaseId( state, 999 ) ).toBeUndefined();
			} );
		} );
	} );

	describe( 'willAtomicSiteRevertAfterPurchaseDeactivation', () => {
		const createState = ( { isAtomic = true, purchases } ) => ( {
			sites: { items: { 1234: { ID: 1234, options: { is_automated_transfer: isAtomic } } } },
			productsList: { items: {} },
			purchases: {
				data: purchases,
				error: null,
				isFetchingSitePurchases: false,
				isFetchingUserPurchases: false,
				hasLoadedSitePurchasesFromServer: true,
				hasLoadedUserPurchasesFromServer: true,
			},
		} );
		const businessPlan = { ID: '1', blog_id: '1234', product_slug: 'business-bundle' };
		const domain = { ID: '2', blog_id: '1234', product_slug: 'domain_reg' };

		test( 'should return true when the only Atomic-supporting purchase is deactivated', () => {
			const state = createState( { purchases: [ businessPlan, domain ] } );

			expect( willAtomicSiteRevertAfterPurchaseDeactivation( state, 1 ) ).toBe( true );
		} );

		test( 'should return false when another Atomic-supporting purchase remains', () => {
			const otherPlan = { ID: '3', blog_id: '1234', product_slug: 'business-bundle-monthly' };
			const state = createState( { purchases: [ businessPlan, otherPlan ] } );

			expect( willAtomicSiteRevertAfterPurchaseDeactivation( state, 1 ) ).toBe( false );
		} );

		test( 'should return true when the remaining Atomic-supporting purchase is linked', () => {
			const otherPlan = { ID: '3', blog_id: '1234', product_slug: 'business-bundle-monthly' };
			const state = createState( { purchases: [ businessPlan, otherPlan ] } );

			expect(
				willAtomicSiteRevertAfterPurchaseDeactivation( state, 1, [
					{ ID: 3, product_slug: 'business-bundle-monthly' },
				] )
			).toBe( true );
		} );

		test( 'should return false when the deactivated purchase does not support Atomic', () => {
			const state = createState( { purchases: [ businessPlan, domain ] } );

			expect( willAtomicSiteRevertAfterPurchaseDeactivation( state, 2 ) ).toBe( false );
		} );

		test( 'should return false when the site is not Atomic', () => {
			const state = createState( { isAtomic: false, purchases: [ businessPlan ] } );

			expect( willAtomicSiteRevertAfterPurchaseDeactivation( state, 1 ) ).toBe( false );
		} );
	} );
} );
