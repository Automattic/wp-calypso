import { YOAST_PREMIUM, YOAST_FREE } from '@automattic/calypso-products';
import { YOAST } from 'calypso/my-sites/marketplace/marketplace-product-definitions';
import {
	getPluginsToInstall,
	getDefaultPluginInProduct,
	getDefaultProductInProductGroup,
	getProductDefinition,
	productGroups,
	findProductDefinition,
} from '../index';

describe( 'Constants and product related utilities test', () => {
	test( 'getPluginsToInstall returns the relevant plugins to be installed', () => {
		const received = getPluginsToInstall( YOAST, YOAST_PREMIUM );
		const expected = productGroups[ YOAST ].products[ YOAST_PREMIUM ].pluginsToBeInstalled;
		expect( received ).toEqual( expected );

		const receivedForNonExistentProduct = getPluginsToInstall(
			'NON_EXISTENT_PRODUCT_GROUP',
			'NON_EXISTENT_PRODUCT'
		);
		expect( receivedForNonExistentProduct ).toEqual( null );
	} );

	test( 'getDefaultProductInProductGroup returns the first found product', () => {
		const received = getDefaultProductInProductGroup( YOAST, YOAST_PREMIUM );
		const expected = Object.keys( productGroups[ YOAST ].products )[ 0 ];
		expect( received ).toEqual( expected );

		const receivedForNonExistentProduct = getDefaultProductInProductGroup(
			'NON_EXISTENT_PRODUCT_GROUP'
		);
		expect( receivedForNonExistentProduct ).toEqual( null );
	} );

	test( 'getDefaultPluginInProduct returns the defined default plugin', () => {
		const received = getDefaultPluginInProduct( YOAST, YOAST_PREMIUM );
		const expected = productGroups[ YOAST ].products[ YOAST_PREMIUM ].defaultPluginSlug;
		expect( received ).toEqual( expected );

		const receivedForNonExistentProduct = getDefaultPluginInProduct(
			'NON_EXISTENT_PRODUCT_GROUP',
			'NON_EXISTENT_PRODUCT'
		);
		expect( receivedForNonExistentProduct ).toEqual( null );
	} );

	test( 'getProductDefinition returns the correct product details, given the product slug and product group', () => {
		const received = getProductDefinition( YOAST, YOAST_FREE );
		const expected = productGroups[ YOAST ].products[ YOAST_FREE ];
		expect( received ).toEqual( expected );

		const receivedForNonExistentProduct = getProductDefinition(
			'NON_EXISTENT_PRODUCT_GROUP',
			'NON_EXISTENT_PRODUCT'
		);
		expect( receivedForNonExistentProduct ).toEqual( null );
	} );

	test( 'findProductDefinition returns the correct product details, given an an available product slug', () => {
		const received = findProductDefinition( YOAST_FREE );
		expect( received ).toEqual( {
			productName: 'Yoast Free',
			defaultPluginSlug: 'wordpress-seo',
			isPurchasableProduct: false,
			pluginsToBeInstalled: [ 'wordpress-seo' ],
		} );
	} );

	test( 'findProductDefinition returns null, given a product slug that does not exist', () => {
		const received = findProductDefinition( 'PRODUCT_SLUG_THAT_DOES_NOT_EXIST' );
		expect( received ).toEqual( null );
	} );
} );
