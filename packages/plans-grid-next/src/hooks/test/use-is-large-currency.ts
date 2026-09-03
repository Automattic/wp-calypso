/**
 * @jest-environment jsdom
 */

import useIsLargeCurrency from '../use-is-large-currency';

jest.mock( '@wordpress/element', () => ( {
	...jest.requireActual( '@wordpress/element' ),
	useMemo: jest.fn().mockImplementation( ( fn ) => fn() ),
} ) );

describe( 'useIsLargeCurrency', () => {
	afterAll( () => {
		jest.clearAllMocks();
	} );

	const smallPrices = [ 0, 0, 100, 0, 2500, 0 ];
	const largePrices = [ 0, 0, 100000, 0, 30000000, 20 ];

	describe( 'Given add on prices', () => {
		describe( 'when all display prices are below 7 digits', () => {
			test( 'should not consider prices to be large large', () => {
				expect(
					useIsLargeCurrency( { prices: smallPrices, isAddOn: true, currencyCode: 'USD' } )
				).toEqual( false );
			} );
		} );

		describe( 'when some display prices are above 7 digits', () => {
			test( 'should consider prices to be large', () => {
				expect(
					useIsLargeCurrency( { prices: largePrices, isAddOn: true, currencyCode: 'USD' } )
				).toEqual( true );
			} );
		} );
	} );

	describe( 'Given plan prices', () => {
		describe( 'when all display prices are below 6 digits', () => {
			test( 'should not consider prices to be large', () => {
				expect(
					useIsLargeCurrency( { prices: smallPrices, isAddOn: false, currencyCode: 'USD' } )
				).toEqual( false );
			} );
		} );

		describe( 'when some display prices are above 6 digits', () => {
			test( 'should consider prices to be large', () => {
				expect(
					useIsLargeCurrency( { prices: largePrices, isAddOn: false, currencyCode: 'USD' } )
				).toEqual( true );
			} );
		} );

		/**
		 * Prices arrive as [ original, discounted ] per plan. Only those two are ever
		 * rendered next to each other, so only those two should be measured together.
		 */
		describe( 'when the combined length is only exceeded across two different plans', () => {
			test( 'should not consider prices to be large', () => {
				// $25 + $19.50 = 9, $99.50 + $49 = 9. Only $19.50 + $99.50 exceeds 9,
				// and those belong to different plans.
				const prices = [ 2500, 1950, 9950, 4900 ];

				expect( useIsLargeCurrency( { prices, isAddOn: false, currencyCode: 'USD' } ) ).toEqual(
					false
				);
			} );
		} );

		describe( "when a plan's own original and discounted prices exceed the combined length", () => {
			test( 'should consider prices to be large', () => {
				// $99.50 + $19.50 = 12, on the same plan.
				const prices = [ 9950, 1950 ];

				expect( useIsLargeCurrency( { prices, isAddOn: false, currencyCode: 'USD' } ) ).toEqual(
					true
				);
			} );
		} );
	} );
} );
