import { getPurchaseURLCallback } from '../get-purchase-url-callback';

describe( 'getPurchaseURLCallback', () => {
	let args;
	let product;

	beforeEach( () => {
		args = {};
		product = {
			productSlug: 'jetpack_backup_t1_yearly',
		};
	} );

	it( "Doesn't adds lang query param if not specified", () => {
		const urlCallback = getPurchaseURLCallback( '', args );
		expect( urlCallback( product ) ).toEqual(
			'https://wordpress.com/checkout/jetpack/jetpack_backup_t1_yearly'
		);
	} );

	it( 'Adds lang query param if specified', () => {
		const urlCallback = getPurchaseURLCallback( '', args, 'fr' );
		expect( urlCallback( product ) ).toEqual(
			'https://wordpress.com/checkout/jetpack/jetpack_backup_t1_yearly?lang=fr'
		);
	} );
} );
