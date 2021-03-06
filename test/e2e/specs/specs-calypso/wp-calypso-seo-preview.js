import assert from 'assert';
import config from 'config';
import { By } from 'selenium-webdriver';
import NavBarComponent from '../../lib/components/nav-bar-component.js';
import SidebarComponent from '../../lib/components/sidebar-component.js';
import * as dataHelper from '../../lib/data-helper';
import * as driverHelper from '../../lib/driver-helper';
import * as driverManager from '../../lib/driver-manager.js';
import LoginFlow from '../../lib/flows/login-flow.js';
import TrafficPage from '../../lib/pages/marketing/traffic-page.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] SEO Preview page: (${ screenSize }) @parallel`, function () {
	this.timeout( mochaTimeOut );

	// Login as Business plan user and open the sidebar
	it( 'Log In', async function () {
		const loginFlow = new LoginFlow( this.driver, 'wooCommerceUser' );
		await loginFlow.login();
		const navBarComponent = await NavBarComponent.Expect( this.driver );
		return await navBarComponent.clickMySites();
	} );

	it( 'Open the marketing page', async function () {
		this.sidebarComponent = await SidebarComponent.Expect( this.driver );
		return await this.sidebarComponent.selectMarketing();
	} );

	it( 'Enter front page meta description and click preview button ', async function () {
		const trafficPage = new TrafficPage( this.driver );
		await trafficPage.openTrafficTab();
		await trafficPage.enterFrontPageMetaAndClickPreviewButton();
	} );

	it( 'Ensure site preview stays open for 10 seconds', async function () {
		await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( '.web-preview.is-seo' )
		);
		const wait = async ( interval ) => {
			return new Promise( ( resolve ) => {
				setTimeout( resolve, interval );
			} );
		};
		await wait( 10000 );
		const previewPane = await this.driver.findElement( By.css( '.web-preview.is-seo' ) );
		assert( previewPane, 'The site preview component has been closed.' );
	} );
} );
