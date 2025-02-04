import isWooCommerceProduct from '../is-woocommerce-product';

describe( 'isWooCommerceProduct', () => {
	it.each( [
		[ 'woocommerce*(%^&)' ],
		[ 'woocommerce-whatever' ],
		[ 'woocommerce' ],
		[ 'woocommerce ' ],
	] )( 'returns true if the input starts with "woocommerce"', ( input ) => {
		expect( isWooCommerceProduct( input ) ).toBe( true );
	} );

	it.each( [
		[ 'literally anything' ],
		[ 'WooCommerce' ],
		[ ' woocommerce' ],
		[ '' ],
		[ 'wooCommerce' ],
	] )( 'returns false if the input does not start with "woocommerce"', ( input ) => {
		expect( isWooCommerceProduct( input ) ).toBe( false );
	} );
} );
