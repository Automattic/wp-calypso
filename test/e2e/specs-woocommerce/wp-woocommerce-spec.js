/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverManager from '../lib/driver-manager';

import NavBarComponent from '../lib/components/nav-bar-component';
import SidebarComponent from '../lib/components/sidebar-component';
import StoreSidebarComponent from '../lib/components/store-sidebar-component';
import StoreDashboardPage from '../lib/pages/woocommerce/store-dashboard-page';

import LoginFlow from '../lib/flows/login-flow';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `Can see WooCommerce option in Calypso '${ screenSize }' @parallel`, function () {
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
		"Cannot see 'Store' option in main Calypso menu for an AT WooCommerce site",
		async function () {
			const sidebarComponent = await SidebarComponent.Expect( driver );
			assert(
				await sidebarComponent.storeOptionRemoved(),
				'The Store menu option is displayed for the AT WooCommerce site'
			);
		}
	);

	step(
		"Can see 'WooCommerce' option in main Calypso menu for an AT WooCommerce site",
		async function () {
			const sidebarComponent = await SidebarComponent.Expect( driver );
			assert(
				await sidebarComponent.woocommerceOptionDisplayed(),
				'The WooCommerce menu option is not displayed for the AT WooCommerce site'
			);
		}
	);

	step( "'WooCommerce' option links to WooCommerce page", async function () {
		const sidebarComponent = await SidebarComponent.Expect( driver );
		assert(
			await sidebarComponent.woocommerceOptionLinksToWoocommerce(),
			'The WooCommerce menu option does not link to WooCommerce page'
		);
	} );
} );

describe( `Can see deprecated Store sidebar menu items '${ screenSize }' @parallel`, function () {
	this.timeout( mochaTimeOut );

	before( async function () {
		await driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	// Login as WooCommerce store user and open the woo store
	step( 'Log In and access store directly via URL', async function () {
		const loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
		return await loginFlow.loginAndAccessStoreDirectly();
	} );

	step( 'Store dashboard displays removal notice', async function () {
		const storeDashboardPage = await StoreDashboardPage.Expect( driver );
		assert(
			await storeDashboardPage.storeMoveNoticeCardDisplayed(),
			'Store dashboard does not display removal notice'
		);
	} );

	step( "Can see 'Products' option in the Woo store sidebar", async function () {
		const storeSidebarComponent = await StoreSidebarComponent.Expect( driver );
		assert(
			await storeSidebarComponent.productsLinkDisplayed(),
			'The store sidebar products link is not displayed'
		);
	} );

	step( "'Products' option links to WooCommerce products page", async function () {
		const storeSidebarComponent = await StoreSidebarComponent.Expect( driver );
		assert(
			await storeSidebarComponent.productsLinksToWoocommerce(),
			"The store sidebar 'Products' option does not link to WooCommerce products page"
		);
	} );

	step( "Can see 'Settings' option in the Woo store sidebar", async function () {
		const storeSidebarComponent = await StoreSidebarComponent.Expect( driver );
		assert(
			await storeSidebarComponent.settingsLinkDisplayed(),
			'The store sidebar settings link is not displayed'
		);
	} );

	step( "'Settings' option links to WooCommerce settings page", async function () {
		const storeSidebarComponent = await StoreSidebarComponent.Expect( driver );
		assert(
			await storeSidebarComponent.settingsLinksToWoocommerce(),
			"The store sidebar 'Settings' option does not link to WooCommerce settings page"
		);
	} );

	step( "Can see 'Orders' option in the Woo store sidebar", async function () {
		const storeSidebarComponent = await StoreSidebarComponent.Expect( driver );
		assert(
			await storeSidebarComponent.ordersLinkDisplayed(),
			'The store sidebar orders link is not displayed'
		);
	} );

	step( "'Orders' option links to WooCommerce orders page", async function () {
		const storeSidebarComponent = await StoreSidebarComponent.Expect( driver );
		assert(
			await storeSidebarComponent.ordersLinksToWoocommerce(),
			"The store sidebar 'Orders' option does not link to WooCommerce orders page"
		);
	} );

	step( "Can see 'Promotions' option in the Woo store sidebar", async function () {
		const storeSidebarComponent = await StoreSidebarComponent.Expect( driver );
		assert(
			await storeSidebarComponent.promotionsLinkDisplayed(),
			'The store sidebar promotions link is not displayed'
		);
	} );

	step( "'Promotions' option links to WooCommerce promotions page", async function () {
		const storeSidebarComponent = await StoreSidebarComponent.Expect( driver );
		assert(
			await storeSidebarComponent.promotionsLinksToWoocommerce(),
			"The store sidebar 'Promotions' option does not link to WooCommerce promotions page"
		);
	} );

	step( "Can see 'Reviews' option in the Woo store sidebar", async function () {
		const storeSidebarComponent = await StoreSidebarComponent.Expect( driver );
		assert(
			await storeSidebarComponent.reviewsLinkDisplayed(),
			'The store sidebar reviews link is not displayed'
		);
	} );

	step( "'Reviews' option links to WooCommerce reviews page", async function () {
		const storeSidebarComponent = await StoreSidebarComponent.Expect( driver );
		assert(
			await storeSidebarComponent.reviewsLinksToWoocommerce(),
			"The store sidebar 'Reviews' option does not link to WooCommerce reviews page"
		);
	} );
} );
