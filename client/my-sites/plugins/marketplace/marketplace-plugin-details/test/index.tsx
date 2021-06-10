/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';

/**
 * Internal dependencies
 */
import PurchaseArea from '../purchase-area';

const onNavigateToCheckoutMockFunction = jest.fn();
const onNavigateToDomainsSelectionMockFunction = jest.fn();
const onAddYoastPremiumToCart = jest.fn();
const onRemoveEverythingFromCart = jest.fn();
const onInstallPluginManually = jest.fn();

describe( '<PurchaseArea/> Plugin details next step tests', () => {
	const wpcomDomain = { isWpcomStagingDomain: true, domain: 'awesomecustomdomain.wordpress.com' };
	const customDomain = { isWpcomStagingDomain: false, domain: 'awesome-custom-domain.io' };
	const primaryWpcomDomain = { isPrimary: true, ...wpcomDomain };
	const primaryCustomDomain = { isPrimary: true, ...customDomain };
	afterEach( () => {
		jest.clearAllMocks();
	} );
	test( 'If user has a primary custom domain and purchases a paid product, redirects to checkout', async () => {
		const marketplacePluginDetails = render(
			<PurchaseArea
				siteDomains={ [ wpcomDomain, primaryCustomDomain ] }
				isProductListLoading={ false }
				displayCost="$ 100"
				wporgPluginName={ 'Yoast SEO' }
				onAddYoastPremiumToCart={ onAddYoastPremiumToCart }
				onNavigateToCheckout={ onNavigateToCheckoutMockFunction }
				onNavigateToDomainsSelection={ onNavigateToDomainsSelectionMockFunction }
				onRemoveEverythingFromCart={ onRemoveEverythingFromCart }
				onInstallPluginManually={ onInstallPluginManually }
			/>
		);
		const yoastPremiumButton = await marketplacePluginDetails.findByText( 'Buy Yoast Premium' );
		await fireEvent.click( yoastPremiumButton );
		// onAddPlugin call in the PurchaseArea component is async so we have to queue and await a promise for the following mocks to be called
		await Promise.resolve();

		expect( onAddYoastPremiumToCart ).toHaveBeenCalled();
		expect( onNavigateToCheckoutMockFunction ).toHaveBeenCalled();
		expect( onNavigateToDomainsSelectionMockFunction ).not.toHaveBeenCalled();
		expect( onInstallPluginManually ).not.toHaveBeenCalled();
	} );

	test( '<PurchaseArea/> If user has no custom domain and purchases any product, redirects to domains step', async () => {
		const marketplacePluginDetails = render(
			<PurchaseArea
				siteDomains={ [ primaryWpcomDomain ] }
				isProductListLoading={ false }
				displayCost="$ 100"
				wporgPluginName={ 'Yoast SEO' }
				onAddYoastPremiumToCart={ onAddYoastPremiumToCart }
				onNavigateToCheckout={ onNavigateToCheckoutMockFunction }
				onNavigateToDomainsSelection={ onNavigateToDomainsSelectionMockFunction }
				onRemoveEverythingFromCart={ onRemoveEverythingFromCart }
				onInstallPluginManually={ onInstallPluginManually }
			/>
		);
		const yoastPremiumButton = await marketplacePluginDetails.findByText( 'Buy Yoast Premium' );
		await fireEvent.click( yoastPremiumButton );
		// onAddPlugin call in the PurchaseArea component is async so we have to queue and await a promise for the following mocks to be called
		await Promise.resolve();

		expect( onAddYoastPremiumToCart ).toHaveBeenCalled();
		expect( onNavigateToCheckoutMockFunction ).not.toHaveBeenCalled();
		expect( onNavigateToDomainsSelectionMockFunction ).toHaveBeenCalled();
		await onAddYoastPremiumToCart.mockReset();
		await onNavigateToCheckoutMockFunction.mockReset();
		await onNavigateToDomainsSelectionMockFunction.mockReset();

		const yoastFreeButton = await marketplacePluginDetails.findByText( 'Add Yoast Free' );
		await fireEvent.click( yoastFreeButton );
		//onAddPlugin call in the PurchaseArea component is async so we have to queue and await a promise  for the following mocks to be called
		await Promise.resolve();

		expect( onAddYoastPremiumToCart ).not.toHaveBeenCalled();
		expect( onNavigateToCheckoutMockFunction ).not.toHaveBeenCalled();
		expect( onNavigateToDomainsSelectionMockFunction ).toHaveBeenCalled();
	} );

	test( 'Remove all other products from basket when adding a marketplace plugin', async () => {
		const marketplacePluginDetails = render(
			<PurchaseArea
				siteDomains={ [ primaryWpcomDomain ] }
				isProductListLoading={ false }
				displayCost="$ 100"
				wporgPluginName={ 'Yoast SEO' }
				onAddYoastPremiumToCart={ onAddYoastPremiumToCart }
				onNavigateToCheckout={ onNavigateToCheckoutMockFunction }
				onNavigateToDomainsSelection={ onNavigateToDomainsSelectionMockFunction }
				onRemoveEverythingFromCart={ onRemoveEverythingFromCart }
				onInstallPluginManually={ onInstallPluginManually }
			/>
		);
		const yoastPremiumButton = await marketplacePluginDetails.findByText( 'Buy Yoast Premium' );
		const yoastFreeButton = await marketplacePluginDetails.findByText( 'Add Yoast Free' );

		await fireEvent.click( yoastPremiumButton );
		expect( onRemoveEverythingFromCart ).toHaveBeenCalled();
		await onRemoveEverythingFromCart.mockReset();

		await fireEvent.click( yoastFreeButton );
		expect( onRemoveEverythingFromCart ).toHaveBeenCalled();
	} );

	test( 'On installation of free plugin trigger callback to install plugin manually', async () => {
		const marketplacePluginDetails = render(
			<PurchaseArea
				siteDomains={ [ primaryWpcomDomain ] }
				isProductListLoading={ false }
				displayCost="$ 100"
				wporgPluginName={ 'Yoast SEO' }
				onAddYoastPremiumToCart={ onAddYoastPremiumToCart }
				onNavigateToCheckout={ onNavigateToCheckoutMockFunction }
				onNavigateToDomainsSelection={ onNavigateToDomainsSelectionMockFunction }
				onRemoveEverythingFromCart={ onRemoveEverythingFromCart }
				onInstallPluginManually={ onInstallPluginManually }
			/>
		);
		const yoastPremiumButton = await marketplacePluginDetails.findByText( 'Buy Yoast Premium' );
		const yoastFreeButton = await marketplacePluginDetails.findByText( 'Add Yoast Free' );

		await fireEvent.click( yoastPremiumButton );
		expect( onInstallPluginManually ).not.toHaveBeenCalledWith();
		await onInstallPluginManually.mockReset();

		await fireEvent.click( yoastFreeButton );
		expect( onInstallPluginManually ).toHaveBeenCalledWith( primaryWpcomDomain.domain );
	} );
} );
