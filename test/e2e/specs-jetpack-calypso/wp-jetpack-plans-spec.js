/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverManager from '../lib/driver-manager';
import * as driverHelper from '../lib/driver-helper';
import * as dataHelper from '../lib/data-helper';

import LoginFlow from '../lib/flows/login-flow';

import PlansPage from '../lib/pages/plans-page';
import WPAdminJetpackPage from '../lib/pages/wp-admin/wp-admin-jetpack-page';

import ReaderPage from '../lib/pages/reader-page.js';
import SecurePaymentComponent from '../lib/components/secure-payment-component.js';
import ShoppingCartWidgetComponent from '../lib/components/shopping-cart-widget-component.js';
import SidebarComponent from '../lib/components/sidebar-component.js';
import NavBarComponent from '../lib/components/nav-bar-component.js';

import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar';

import WPAdminLogonPage from '../lib/pages/wp-admin/wp-admin-logon-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Jetpack Plans: (${ screenSize }) @jetpack`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Purchase Business Plan:', function () {
		before( async function () {
			return await driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		step( 'Can log into WordPress.com', async function () {
			this.loginFlow = new LoginFlow( driver );
			return await this.loginFlow.login();
		} );

		step( 'Can log into site via Jetpack SSO', async function () {
			const loginPage = await WPAdminLogonPage.Visit( driver, dataHelper.getJetpackSiteName() );
			return await loginPage.logonSSO();
		} );

		step( 'Can open Jetpack dashboard', async function () {
			await WPAdminSidebar.refreshIfJNError( driver );
			const wpAdminSidebar = await WPAdminSidebar.Expect( driver );
			return await wpAdminSidebar.selectJetpack();
		} );

		step( 'Can find and click Upgrade nudge button', async function () {
			await driverHelper.refreshIfJNError( driver );
			const jetpackDashboard = await WPAdminJetpackPage.Expect( driver );
			return await jetpackDashboard.clickUpgradeNudge();
		} );

		step( 'Can then see secure payment component and Search in the cart', async function () {
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
			return await securePaymentComponent.containsPlan( 'jetpack_search' );
		} );

		// Remove all items from basket for clean up
		after( async function () {
			await ReaderPage.Visit( driver );

			const navbarComponent = await NavBarComponent.Expect( driver );
			await navbarComponent.clickMySites();

			const sidebarComponent = await SidebarComponent.Expect( driver );
			await sidebarComponent.selectPlans();

			await PlansPage.Expect( driver );
			const shoppingCartWidgetComponent = await ShoppingCartWidgetComponent.Expect( driver );
			await shoppingCartWidgetComponent.empty();
		} );
	} );
} );
