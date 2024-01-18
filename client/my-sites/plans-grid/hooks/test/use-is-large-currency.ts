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

		describe( 'when a pair of original and discounted prices are above 9 digits', () => {
			test( 'should consider it large', () => {
				const largeCombinedPlanPrices = [ 20000, 3000 ];

				expect(
					useIsLargeCurrency( {
						prices: largeCombinedPlanPrices,
						isAddOn: false,
						currencyCode: 'USD',
					} )
				).toEqual( false );
			} );
		} );
	} );
} );
