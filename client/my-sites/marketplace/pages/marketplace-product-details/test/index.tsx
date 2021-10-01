/**
 * @jest-environment jsdom
 */

import { YOAST_PREMIUM, YOAST_FREE } from '@automattic/calypso-products';
import { render, fireEvent } from '@testing-library/react';
import PurchaseArea from '../purchase-area';

const onNavigateToCheckoutMockFunction = jest.fn();
const onNavigateToDomainsSelectionMockFunction = jest.fn();
const onAddMarketplaceProductToCart = jest.fn();
const onRemoveEverythingFromCart = jest.fn();
const onInstallProductManually = jest.fn();

describe( '<PurchaseArea/> Plugin details next step tests', () => {
	const wpcomDomain = { isWpcomStagingDomain: true, domain: 'awesomecustomdomain.wordpress.com' };
	const customDomain = { isWpcomStagingDomain: false, domain: 'awesome-custom-domain.io' };
	const primaryWpcomDomain = { isPrimary: true, ...wpcomDomain };
	const primaryCustomDomain = { isPrimary: true, ...customDomain };
	afterEach( () => {
		jest.clearAllMocks();
	} );
	test( 'If user has a primary custom domain and purchases a paid product, should redirect to checkout', async () => {
		const marketplacePluginDetails = render(
			<PurchaseArea
				productSlug={ YOAST_PREMIUM }
				siteDomains={ [ wpcomDomain, primaryCustomDomain ] }
				displayCost="$ 100"
				onAddMarketplaceProductToCart={ onAddMarketplaceProductToCart }
				onNavigateToCheckout={ onNavigateToCheckoutMockFunction }
				onNavigateToDomainsSelection={ onNavigateToDomainsSelectionMockFunction }
				onRemoveEverythingFromCart={ onRemoveEverythingFromCart }
				onInstallProductManually={ onInstallProductManually }
			/>
		);
		const yoastPremiumButton = await marketplacePluginDetails.findByText( 'Add Yoast Premium' );
		await fireEvent.click( yoastPremiumButton );
		// onAddPlugin call in the PurchaseArea component is async so we have to queue and await a promise for the following mocks to be called
		await Promise.resolve();

		expect( onAddMarketplaceProductToCart ).toHaveBeenCalledWith(
			YOAST_PREMIUM,
			customDomain.domain
		);
		expect( onNavigateToCheckoutMockFunction ).toHaveBeenCalled();
		expect( onNavigateToDomainsSelectionMockFunction ).not.toHaveBeenCalled();
		expect( onInstallProductManually ).not.toHaveBeenCalled();
	} );

	test( '<PurchaseArea/> If user has no custom domain and adds a paid product, should redirect to domains step', async () => {
		const marketplacePluginDetails = render(
			<PurchaseArea
				productSlug={ YOAST_PREMIUM }
				siteDomains={ [ primaryWpcomDomain ] }
				displayCost="$ 100"
				onAddMarketplaceProductToCart={ onAddMarketplaceProductToCart }
				onNavigateToCheckout={ onNavigateToCheckoutMockFunction }
				onNavigateToDomainsSelection={ onNavigateToDomainsSelectionMockFunction }
				onRemoveEverythingFromCart={ onRemoveEverythingFromCart }
				onInstallProductManually={ onInstallProductManually }
			/>
		);
		const yoastPremiumButton = await marketplacePluginDetails.findByText( 'Add Yoast Premium' );
		await fireEvent.click( yoastPremiumButton );
		// onAddPlugin call in the PurchaseArea component is async so we have to queue and await a promise for the following mocks to be called
		await Promise.resolve();

		expect( onAddMarketplaceProductToCart ).toHaveBeenCalled();
		expect( onNavigateToCheckoutMockFunction ).not.toHaveBeenCalled();
		expect( onNavigateToDomainsSelectionMockFunction ).toHaveBeenCalled();
	} );

	test( '<PurchaseArea/> If user has no custom domain and adds a free product, should redirect to domains step', async () => {
		const marketplacePluginDetails = render(
			<PurchaseArea
				productSlug={ YOAST_FREE }
				siteDomains={ [ primaryWpcomDomain ] }
				displayCost="$ 100"
				onAddMarketplaceProductToCart={ onAddMarketplaceProductToCart }
				onNavigateToCheckout={ onNavigateToCheckoutMockFunction }
				onNavigateToDomainsSelection={ onNavigateToDomainsSelectionMockFunction }
				onRemoveEverythingFromCart={ onRemoveEverythingFromCart }
				onInstallProductManually={ onInstallProductManually }
			/>
		);
		const yoastFreeButton = await marketplacePluginDetails.findByText( 'Add Yoast Free' );
		await fireEvent.click( yoastFreeButton );
		//onAddPlugin call in the PurchaseArea component is async so we have to queue and await a promise  for the following mocks to be called
		await Promise.resolve();

		expect( onAddMarketplaceProductToCart ).not.toHaveBeenCalled();
		expect( onNavigateToCheckoutMockFunction ).not.toHaveBeenCalled();
		expect( onNavigateToDomainsSelectionMockFunction ).toHaveBeenCalled();
	} );

	test( 'Remove all other products from basket when adding a paid marketplace plugin', async () => {
		const marketplacePluginDetails = render(
			<PurchaseArea
				productSlug={ YOAST_PREMIUM }
				siteDomains={ [ primaryWpcomDomain ] }
				displayCost="$ 100"
				onAddMarketplaceProductToCart={ onAddMarketplaceProductToCart }
				onNavigateToCheckout={ onNavigateToCheckoutMockFunction }
				onNavigateToDomainsSelection={ onNavigateToDomainsSelectionMockFunction }
				onRemoveEverythingFromCart={ onRemoveEverythingFromCart }
				onInstallProductManually={ onInstallProductManually }
			/>
		);
		const yoastPremiumButton = await marketplacePluginDetails.findByText( 'Add Yoast Premium' );
		await fireEvent.click( yoastPremiumButton );
		expect( onRemoveEverythingFromCart ).toHaveBeenCalled();
	} );

	test( 'Remove all other products from basket when adding a free marketplace plugin', async () => {
		const marketplacePluginDetails = render(
			<PurchaseArea
				productSlug={ YOAST_FREE }
				siteDomains={ [ primaryWpcomDomain ] }
				displayCost="$ 100"
				onAddMarketplaceProductToCart={ onAddMarketplaceProductToCart }
				onNavigateToCheckout={ onNavigateToCheckoutMockFunction }
				onNavigateToDomainsSelection={ onNavigateToDomainsSelectionMockFunction }
				onRemoveEverythingFromCart={ onRemoveEverythingFromCart }
				onInstallProductManually={ onInstallProductManually }
			/>
		);
		const yoastFreeButton = await marketplacePluginDetails.findByText( 'Add Yoast Free' );
		await fireEvent.click( yoastFreeButton );
		expect( onRemoveEverythingFromCart ).toHaveBeenCalled();
	} );

	test( 'On installation of free plugin trigger callback to install plugin manually', async () => {
		const marketplacePluginDetails = render(
			<PurchaseArea
				productSlug={ YOAST_FREE }
				siteDomains={ [ primaryWpcomDomain ] }
				displayCost="$ 100"
				onAddMarketplaceProductToCart={ onAddMarketplaceProductToCart }
				onNavigateToCheckout={ onNavigateToCheckoutMockFunction }
				onNavigateToDomainsSelection={ onNavigateToDomainsSelectionMockFunction }
				onRemoveEverythingFromCart={ onRemoveEverythingFromCart }
				onInstallProductManually={ onInstallProductManually }
			/>
		);
		const yoastFreeButton = await marketplacePluginDetails.findByText( 'Add Yoast Free' );
		await fireEvent.click( yoastFreeButton );
		expect( onInstallProductManually ).toHaveBeenCalledWith(
			YOAST_FREE,
			primaryWpcomDomain.domain
		);
	} );
} );
