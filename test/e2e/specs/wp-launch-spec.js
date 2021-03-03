/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';

import LoginFlow from '../lib/flows/login-flow.js';
import CreateSiteFlow from '../lib/flows/create-site-flow.js';
import LaunchSiteFlow from '../lib/flows/launch-site-flow.js';
import DeleteSiteFlow from '../lib/flows/delete-site-flow.js';
import SidebarComponent from '../lib/components/sidebar-component';

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

	describe( 'Launch a free site', function () {
		const siteName = dataHelper.getNewBlogName();

		before( 'Can log in', async function () {
			const loginFlow = new LoginFlow( driver );
			await loginFlow.login();
		} );

		step( 'Can create a free site', async function () {
			return await new CreateSiteFlow( driver, siteName ).createFreeSite();
		} );

		step( 'Can launch a site', async function () {
			return await new LaunchSiteFlow( driver ).launchFreeSite();
		} );

		after( 'Delete the newly created site', async function () {
			const deleteSite = new DeleteSiteFlow( driver );
			return await deleteSite.deleteSite( siteName + '.wordpress.com' );
		} );
	} );

	// Tracking issue:
	// https://github.com/Automattic/wp-calypso/issues/50547
	// Potential issue that trigger this failure:
	// https://github.com/Automattic/wp-calypso/issues/50273
	describe.only( 'Launch when having multiple sites', function () {
		const firstSiteName = dataHelper.getNewBlogName();
		const secondSiteName = dataHelper.getNewBlogName();

		before( 'Can log in', async function () {
			const loginFlow = new LoginFlow( driver );
			await loginFlow.login();
		} );

		step( 'Can create free sites', async function () {
			await new CreateSiteFlow( driver, firstSiteName ).createFreeSite();
			return await new CreateSiteFlow( driver, secondSiteName ).createFreeSite();
		} );

		// step( 'Can start launch flow and abandon', async function () {
		// 	const myHomePage = await MyHomePage.Expect( driver );
		// 	await myHomePage.launchSiteFromSiteSetup();
		// 	await FindADomainComponent.Expect( driver );
		// 	// force reloading the page from the server to simulate an expired cache
		// 	await driver.executeScript( 'window.location.reload(true);' );
		// 	await FindADomainComponent.Expect( driver );
		// 	return await driver.navigate().back();
		// } );

		step( 'Can switch sites and launch the first site', async function () {
			const sideBarComponent = await SidebarComponent.Expect( driver );
			await sideBarComponent.selectSiteSwitcher();
			await sideBarComponent.searchForSite( firstSiteName );
			if ( driverManager.currentScreenSize() === 'mobile' ) {
				await sideBarComponent.ensureSidebarMenuVisible();
				await sideBarComponent.selectMyHome();
			}
			return await new LaunchSiteFlow( driver ).launchFreeSite();
		} );

		step( 'Can switch sites and launch the second site', async function () {
			const sideBarComponent = await SidebarComponent.Expect( driver );
			await sideBarComponent.selectSiteSwitcher();
			await sideBarComponent.searchForSite( secondSiteName );
			if ( driverManager.currentScreenSize() === 'mobile' ) {
				await sideBarComponent.ensureSidebarMenuVisible();
				await sideBarComponent.selectMyHome();
			}
			return await new LaunchSiteFlow( driver ).launchFreeSite();
		} );

		after( 'Delete the newly created site', async function () {
			const deleteSite = new DeleteSiteFlow( driver );
			await deleteSite.deleteSite( firstSiteName + '.wordpress.com' );
			return await deleteSite.deleteSite( secondSiteName + '.wordpress.com' );
		} );
	} );
} );
