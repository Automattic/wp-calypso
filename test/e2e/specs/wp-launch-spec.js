/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';

import CreateSiteFlow from '../lib/flows/create-site-flow.js';
import LaunchSiteFlow from '../lib/flows/launch-site-flow.js';
import LoginFlow from '../lib/flows/login-flow.js';
import FindADomainComponent from '../lib/components/find-a-domain-component.js';
import SidebarComponent from '../lib/components/sidebar-component';
import MyHomePage from '../lib/pages/my-home-page.js';
import SettingsPage from '../lib/pages/settings-page';

const host = dataHelper.getJetpackHost();
const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Launch (${ screenSize }) @signup @parallel`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Create and launch a free site as existing user', function () {
		const siteName = dataHelper.getNewBlogName();
		const siteURL = siteName + '.wordpress.com';

		step( 'Can log in', async function () {
			const loginFlow = new LoginFlow( driver );
			return await loginFlow.login();
		} );

		step( 'Can create a free site', async function () {
			return await new CreateSiteFlow( driver, siteName ).createFreeSite();
		} );

		step( 'Can launch a site', async function () {
			return await new LaunchSiteFlow( driver ).launchFreeSite();
		} );

		step( 'Can delete site', async function () {
			const sidebarComponent = await SidebarComponent.Expect( driver );
			await sidebarComponent.ensureSidebarMenuVisible();
			await sidebarComponent.selectSettings();
			const settingsPage = await SettingsPage.Expect( driver );
			return await settingsPage.deleteSite( siteURL );
		} );
	} );

	describe( 'Create and launch multiple sites as existing user', function () {
		const firstSiteName = dataHelper.getNewBlogName();
		const secondSiteName = dataHelper.getNewBlogName();

		step( 'Can log in', async function () {
			const loginFlow = new LoginFlow( driver );
			return await loginFlow.login();
		} );

		step( 'Can create first free site', async function () {
			return await new CreateSiteFlow( driver, firstSiteName ).createFreeSite();
		} );

		step( 'Can create second free site', async function () {
			return await new CreateSiteFlow( driver, secondSiteName ).createFreeSite();
		} );

		step( 'Can start launch flow and abandon', async function () {
			const myHomePage = await MyHomePage.Expect( driver );
			await myHomePage.launchSiteFromSiteSetup();
			await FindADomainComponent.Expect( driver );
			// force reloading the page from the server to simulate an expired cache
			await driver.executeScript( 'window.location.reload(true);' );
			await FindADomainComponent.Expect( driver );
			return await driver.navigate().back();
		} );

		step( 'Can switch sites', async function () {
			const sideBarComponent = await SidebarComponent.Expect( driver );
			await sideBarComponent.selectSiteSwitcher();
			await sideBarComponent.searchForSite( firstSiteName );
			if ( driverManager.currentScreenSize() === 'mobile' ) {
				await sideBarComponent.ensureSidebarMenuVisible();
				await sideBarComponent.selectMyHome();
			}
		} );

		step( 'Can launch first site', async function () {
			return await new LaunchSiteFlow( driver ).launchFreeSite();
		} );

		step( 'Can delete sites', async function () {
			const siteURLs = [ firstSiteName + '.wordpress.com', secondSiteName + 'wordpress.com' ];
			for ( const siteURL of siteURLs ) {
				const sidebarComponent = await SidebarComponent.Expect( driver );
				await sidebarComponent.ensureSidebarMenuVisible();
				await sidebarComponent.selectSettings();
				const settingsPage = await SettingsPage.Expect( driver );
				return await settingsPage.deleteSite( siteURL );
			}
		} );
	} );
} );
