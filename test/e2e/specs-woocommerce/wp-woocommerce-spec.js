/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';

import NavBarComponent from '../lib/components/nav-bar-component';
import SidebarComponent from '../lib/components/sidebar-component';
import StoreSidebarComponent from '../lib/components/store-sidebar-component';
import StoreSettingsPage from '../lib/pages/woocommerce/store-settings-page';
import StoreOrdersPage from '../lib/pages/woocommerce/store-orders-page';
import StoreOrderDetailsPage from '../lib/pages/woocommerce/store-order-details-page';
import StoreProductsPage from '../lib/pages/woocommerce/store-products-page';
import AddEditProductPage from '../lib/pages/woocommerce/add-edit-product-page';
import StoreDashboardPage from '../lib/pages/woocommerce/store-dashboard-page';

import LoginFlow from '../lib/flows/login-flow';
import NoticesComponent from '../lib/components/notices-component';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `Can see WooCommerce Store option in Calypso '${ screenSize }' @parallel`, function () {
	this.timeout( mochaTimeOut );

	before( async function () {
		await driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	// Login as WooCommerce store user and open the sidebar
	step( 'Log In', async function () {
		const loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
		await loginFlow.login();
		const navBarComponent = await NavBarComponent.Expect( driver );
		return await navBarComponent.clickMySites();
	} );

	step(
		"Can see 'Store' option in main Calypso menu for an AT WooCommerce site set to the US",
		async function () {
			const sidebarComponent = await SidebarComponent.Expect( driver );
			assert(
				await sidebarComponent.storeOptionDisplayed(),
				'The Store menu option is not displayed for the AT WooCommerce site set to the US'
			);
		}
	);

	step( "The 'Store' option opens the store dashboard with its own sidebar", async function () {
		const sidebarComponent = await SidebarComponent.Expect( driver );
		await sidebarComponent.selectStoreOption();
		await StoreDashboardPage.Expect( driver );
		return await StoreSidebarComponent.Expect( driver );
	} );
} );

describe( `Can see WooCommerce products in Calypso '${ screenSize }' @parallel`, function () {
	this.timeout( mochaTimeOut );

	before( async function () {
		await driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	// Login as WooCommerce store user and open the woo store
	step( 'Log In', async function () {
		const loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
		return await loginFlow.loginAndOpenWooStore();
	} );

	step( "Can see 'Products' option in the Woo store sidebar", async function () {
		const storeSidebarComponent = await StoreSidebarComponent.Expect( driver );
		assert(
			await storeSidebarComponent.productsLinkDisplayed(),
			'The store sidebar products link is not displayed'
		);
	} );

	step(
		'Can see the products page with at least one product when selecting the products option in the Woo store sidebar',
		async function () {
			const storeSidebarComponent = await StoreSidebarComponent.Expect( driver );
			await storeSidebarComponent.selectProducts();
			const storeProductsPage = await StoreProductsPage.Expect( driver );
			assert(
				await storeProductsPage.atLeastOneProductDisplayed(),
				'No Woo products are displayed on the product page'
			);
		}
	);
} );

describe( `Can add a new WooCommerce product in Calypso '${ screenSize }' @parallel`, function () {
	this.timeout( mochaTimeOut );

	before( async function () {
		await driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	// Login as WooCommerce store user and open the woo store
	step( 'Log In', async function () {
		const loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
		return await loginFlow.loginAndOpenWooStore();
	} );

	step( 'Can add a new product via the Products Menu in the Woo store sidebar', async function () {
		const productTitle = dataHelper.randomPhrase();
		const productDescription = 'Another test e2e product';
		const storeSidebarComponent = await StoreSidebarComponent.Expect( driver );
		await storeSidebarComponent.addProduct();
		const addProductPage = await AddEditProductPage.Expect( driver );
		await addProductPage.enterTitle( productTitle );
		await addProductPage.enterDescription( productDescription );
		await addProductPage.setPrice( '888.00' );
		await addProductPage.setDimensions( '6', '7', '8' );
		await addProductPage.setWeight( '2.2' );
		await addProductPage.addQuantity( '80' );
		await addProductPage.allowBackorders();
		await addProductPage.addCategory( 'Art' ); //Adding a category at the end to prevent errors being thrown on save
		await addProductPage.saveAndPublish();
		const noticesComponent = await NoticesComponent.Expect( driver );
		await noticesComponent.isSuccessNoticeDisplayed();
		let storeProductsPage = await StoreProductsPage.Expect( driver );
		assert(
			await storeProductsPage.productDisplayed( productTitle ),
			`The product '${ productTitle }' isn't being displayed on the products page after being added`
		);
		await storeProductsPage.selectProduct( productTitle );
		const editProductPage = await AddEditProductPage.Expect( driver );
		await editProductPage.deleteProduct();
		await noticesComponent.isSuccessNoticeDisplayed();
		storeProductsPage = await StoreProductsPage.Expect( driver );
		assert(
			! ( await storeProductsPage.productDisplayed( productTitle ) ),
			`The product '${ productTitle }' is still being displayed on the products page after being deleted`
		);
	} );
} );

describe( `Can see WooCommerce orders in Calypso '${ screenSize }' @parallel`, function () {
	this.timeout( mochaTimeOut );

	before( async function () {
		await driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	// Login as WooCommerce store user and open the woo store
	step( 'Log In', async function () {
		const loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
		return await loginFlow.loginAndOpenWooStore();
	} );

	step( "Can see 'Orders' option in the Woo store sidebar", async function () {
		const storeSidebarComponent = await StoreSidebarComponent.Expect( driver );
		assert(
			await storeSidebarComponent.productsLinkDisplayed(),
			'The store sidebar orders link is not displayed'
		);
	} );

	step(
		'Can see the orders page with at least one order when selecting the orders option in the Woo store sidebar',
		async function () {
			const storeSidebarComponent = await StoreSidebarComponent.Expect( driver );
			await storeSidebarComponent.selectOrders();
			const storeOrdersPage = await StoreOrdersPage.Expect( driver );
			assert(
				await storeOrdersPage.atLeastOneOrderDisplayed(),
				'No Woo orders are displayed on the orders page'
			);
		}
	);

	step(
		'Can see the order details page when opening an order, product details page when clicking a product in an order',
		async function () {
			const storeSidebarComponent = await StoreSidebarComponent.Expect( driver );
			await storeSidebarComponent.selectOrders();
			const storeOrdersPage = await StoreOrdersPage.Expect( driver );
			await storeOrdersPage.clickFirstOrder();
			const storeOrderDetailsPage = await StoreOrderDetailsPage.Expect( driver );
			await storeOrderDetailsPage.clickFirstProduct();
			return await AddEditProductPage.Expect( driver );
		}
	);
} );

describe( `Can see WooCommerce settings in Calypso '${ screenSize }' @parallel`, function () {
	this.timeout( mochaTimeOut );

	before( async function () {
		await driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	// Login as WooCommerce store user and open the woo store
	step( 'Log In', async function () {
		const loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
		return await loginFlow.loginAndOpenWooStore();
	} );

	step( "Can see 'Settings' option in the Woo store sidebar", async function () {
		const storeSidebarComponent = await StoreSidebarComponent.Expect( driver );
		assert(
			await storeSidebarComponent.settingsLinkDisplayed(),
			'The store sidebar settings link is not displayed'
		);
	} );

	step(
		'Can see the settings page when selecting the settings option in the Woo store sidebar',
		async function () {
			const storeSidebarComponent = await StoreSidebarComponent.Expect( driver );
			return await storeSidebarComponent.selectSettings();
		}
	);

	step( 'Can select payments, shipping, and taxes tabs on the settings page', async function () {
		const storeSidebarComponent = await StoreSidebarComponent.Expect( driver );
		await storeSidebarComponent.selectSettings();
		const storeSettingsPage = await StoreSettingsPage.Expect( driver );
		await storeSettingsPage.selectPaymentsTab();
		assert(
			await storeSettingsPage.paymentsSettingsDisplayed(),
			'The payment settings were not displayed'
		);
		await storeSettingsPage.selectShippingTab();
		assert(
			await storeSettingsPage.shippingSettingsDisplayed(),
			'The shipping settings were not displayed'
		);
		await storeSettingsPage.selectTaxesTab();
		assert(
			await storeSettingsPage.taxesSettingsDisplayed(),
			'The taxes settings were not displayed'
		);
	} );
} );
