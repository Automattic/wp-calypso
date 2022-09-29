import { getDIFMTieredPriceDetails, WPCOM_DIFM_LITE } from '../src';

describe( 'getDIFMTieredPriceDetails', () => {
	it( 'should return null if product is null', () => {
		expect( getDIFMTieredPriceDetails( null ) ).toBe( null );
	} );

	it( 'should return null if product is not DIFM', () => {
		expect( getDIFMTieredPriceDetails( { product_slug: 'random' } ) ).toBe( null );
	} );

	it( 'should return null if product does not have a price tier', () => {
		expect( getDIFMTieredPriceDetails( { product_slug: WPCOM_DIFM_LITE } ) ).toBe( null );
	} );

	it( 'should return null if product does not have a valid price tier', () => {
		expect(
			getDIFMTieredPriceDetails( { product_slug: WPCOM_DIFM_LITE, price_tier_list: 'random' } )
		).toBe( null );
	} );

	it( 'should return null if product is price tier list is empty', () => {
		expect(
			getDIFMTieredPriceDetails( { product_slug: WPCOM_DIFM_LITE, price_tier_list: [] } )
		).toBe( null );
	} );

	const priceTierList = [
		{
			minimum_units: 0,
			maximum_units: 5,
			minimum_price: 49900,
			maximum_price: 49900,
			minimum_price_display: 'US$499',
			minimum_price_monthly_display: 'US$41.59',
			maximum_price_display: 'US$499',
			maximum_price_monthly_display: 'US$41.59',
		},
		{
			minimum_units: 6,
			maximum_units: null,
			minimum_price: 56800,
			maximum_price: 0,
			minimum_price_display: 'US$568',
			minimum_price_monthly_display: 'US$47.34',
			maximum_price_display: null,
			maximum_price_monthly_display: null,
		},
	];

	it( 'should return details if noOfPages is not passed', () => {
		expect(
			getDIFMTieredPriceDetails( { product_slug: WPCOM_DIFM_LITE, price_tier_list: priceTierList } )
		).toEqual( {
			extraPageCount: null,
			numberOfIncludedPages: 5,
			extraPagesPrice: null,
			oneTimeFee: 49900,
			formattedOneTimeFee: 'US$499',
			perExtraPagePrice: 6900,
		} );
	} );

	it( 'should return calculated details if noOfPages is less than 5', () => {
		expect(
			getDIFMTieredPriceDetails(
				{ product_slug: WPCOM_DIFM_LITE, price_tier_list: priceTierList },
				3
			)
		).toEqual( {
			extraPageCount: 0,
			numberOfIncludedPages: 5,
			extraPagesPrice: 0,
			oneTimeFee: 49900,
			formattedOneTimeFee: 'US$499',
			perExtraPagePrice: 6900,
		} );
	} );

	it( 'should return calculated details if noOfPages is greater than 5', () => {
		expect(
			getDIFMTieredPriceDetails(
				{ product_slug: WPCOM_DIFM_LITE, price_tier_list: priceTierList },
				7
			)
		).toEqual( {
			extraPageCount: 2,
			numberOfIncludedPages: 5,
			extraPagesPrice: 13800,
			oneTimeFee: 49900,
			formattedOneTimeFee: 'US$499',
			perExtraPagePrice: 6900,
		} );
	} );
} );
