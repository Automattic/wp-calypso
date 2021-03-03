/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper';
import * as driverHelper from '../lib/driver-helper';

import LoginFlow from '../lib/flows/login-flow.js';

import TrafficPage from '../lib/pages/marketing/traffic-page.js';

import NavBarComponent from '../lib/components/nav-bar-component.js';
import SidebarComponent from '../lib/components/sidebar-component.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
	await driverManager.clearCookiesAndDeleteLocalStorage( driver );
} );

describe( `[${ host }] SEO Preview page: (${ screenSize }) @parallel`, function () {
	this.timeout( mochaTimeOut );
	describe( 'SEO Preview page:', function () {
		// Login as Business plan user and open the sidebar
		step( 'Log In', async function () {
			const loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
			await loginFlow.login();
			const navBarComponent = await NavBarComponent.Expect( driver );
			return await navBarComponent.clickMySites();
		} );

		step( 'Open the marketing page', async function () {
			this.sidebarComponent = await SidebarComponent.Expect( driver );
			return await this.sidebarComponent.selectMarketing();
		} );

		step( 'Enter front page meta description and click preview button ', async function () {
			const trafficPage = new TrafficPage( driver );
			await trafficPage.openTrafficTab();
			await trafficPage.enterFrontPageMetaAndClickPreviewButton();
		} );

		step( 'Ensure site preview stays open for 10 seconds', async function () {
			await driverHelper.waitTillPresentAndDisplayed( driver, By.css( '.web-preview.is-seo' ) );
			const wait = async ( interval ) => {
				return new Promise( ( resolve ) => {
					setTimeout( resolve, interval );
				} );
			};
			await wait( 10000 );
			const previewPane = await driver.findElement( By.css( '.web-preview.is-seo' ) );
			assert( previewPane, 'The site preview component has been closed.' );
		} );
	} );
} );
