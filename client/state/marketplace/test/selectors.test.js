import * as userSelectors from 'calypso/state/current-user/selectors';
import { canPublishPluginReview } from 'calypso/state/marketplace/selectors';
import * as productListSelectors from 'calypso/state/products-list/selectors';
import * as purchasesSelectors from 'calypso/state/purchases/selectors';

jest.mock( 'calypso/state/products-list/selectors' );
jest.mock( 'calypso/state/current-user/selectors' );
jest.mock( 'calypso/state/purchases/selectors' );

describe( 'canPublishPluginReview', () => {
	beforeAll( () => {
		purchasesSelectors.getUserPurchases.mockReturnValue( [] );
	} );

	it( 'returns true if the user is logged in and the plugin is not a marketplace product', () => {
		productListSelectors.isMarketplaceProduct.mockReturnValue( false );
		userSelectors.isUserLoggedIn.mockReturnValue( true );

		const result = canPublishPluginReview( {}, 'pluginSlug', [] );

		expect( result ).toBe( true );
	} );

	it( 'returns false if the user is not logged in', () => {
		userSelectors.isUserLoggedIn.mockReturnValue( false );

		const result = canPublishPluginReview( {}, 'pluginSlug', [] );

		expect( result ).toBe( false );
	} );

	it( 'returns true if the user is logged in and has an active subscription for a marketplace product', () => {
		productListSelectors.isMarketplaceProduct.mockReturnValue( true );
		userSelectors.isUserLoggedIn.mockReturnValue( true );
		purchasesSelectors.getUserPurchases.mockReturnValue( [
			{ productId: 'plugin_variation__annual' },
		] );

		const variations = [
			{ product_id: 'plugin_variation__annual' },
			{ product_id: 'plugin_variation__monthly' },
		];
		const result = canPublishPluginReview( {}, 'pluginSlug', variations );

		expect( result ).toBe( true );
	} );

	it( 'returns false if the user is logged in but does not have an active subscription for a marketplace product', () => {
		productListSelectors.isMarketplaceProduct.mockReturnValue( true );
		userSelectors.isUserLoggedIn.mockReturnValue( true );
		purchasesSelectors.getUserPurchases.mockReturnValue( [
			{ productId: 'plugin_variation__annual' },
		] );

		const variations = [
			{ product_id: 'plugin2_variation__annual' },
			{ product_id: 'plugin2_variation__monthly' },
		];
		const result = canPublishPluginReview( {}, 'pluginSlug', variations );

		expect( result ).toBe( false );
	} );
} );
