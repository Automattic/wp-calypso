/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';

import SignUpFlow from '../lib/flows/sign-up-flow.js';
import CreateSiteFlow from '../lib/flows/create-site-flow.js';
import LaunchSiteFlow from '../lib/flows/launch-site-flow.js';
import DeleteAccountFlow from '../lib/flows/delete-account-flow.js';
import SidebarComponent from '../lib/components/sidebar-component';
import FindADomainComponent from '../lib/components/find-a-domain-component.js';
import MyHomePage from '../lib/pages/my-home-page.js';

const host = dataHelper.getJetpackHost();
const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const signupInboxId = config.get( 'signupInboxId' );

let driver;
const createAndActivateAccount = async function ( accountName ) {
	const emailAddress = dataHelper.getEmailAddress( accountName, signupInboxId );
	const password = config.get( 'passwordForNewTestSignUps' );

	const signupFlow = new SignUpFlow( driver, {
		accountName,
		emailAddress: emailAddress,
		password: password,
	} );
	await signupFlow.signupFreeAccount();
	await signupFlow.activateAccount();
};

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Launch (${ screenSize }) @signup @parallel`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Launch a free site', function () {
		const accountName = dataHelper.getNewBlogName();
		const siteName = dataHelper.getNewBlogName();

		before( 'Create a site as a new user', async function () {
			await createAndActivateAccount( accountName );
			await new CreateSiteFlow( driver, siteName ).createFreeSite();
		} );

		step( 'Can launch a site', async function () {
			return await new LaunchSiteFlow( driver ).launchFreeSite();
		} );

		after( 'Delete the newly created account', async function () {
			return await new DeleteAccountFlow( driver ).deleteAccount( accountName );
		} );
	} );

	describe( 'Launch when having multiple sites', function () {
		const accountName = dataHelper.getNewBlogName();
		const firstSiteName = dataHelper.getNewBlogName();
		const secondSiteName = dataHelper.getNewBlogName();

		before( 'Create 2 free sites as a new user', async function () {
			await createAndActivateAccount( accountName );
			await new CreateSiteFlow( driver, firstSiteName ).createFreeSite();
			await new CreateSiteFlow( driver, secondSiteName ).createFreeSite();
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

		after( 'Delete the newly created account', async function () {
			return await new DeleteAccountFlow( driver ).deleteAccount( accountName );
		} );
	} );
} );
