/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverManager from '../../lib/driver-manager.js';
import * as dataHelper from '../../lib/data-helper.js';

import SignUpFlow from '../../lib/flows/sign-up-flow.js';
import LoginFlow from '../../lib/flows/login-flow.js';
import CreateSiteFlow from '../../lib/flows/create-site-flow.js';
import LaunchSiteFlow from '../../lib/flows/launch-site-flow.js';
import DeleteAccountFlow from '../../lib/flows/delete-account-flow.js';
import DeleteSiteFlow from '../../lib/flows/delete-site-flow.js';
import SidebarComponent from '../../lib/components/sidebar-component';
import FindADomainComponent from '../../lib/components/find-a-domain-component.js';
import MyHomePage from '../../lib/pages/my-home-page.js';

const host = dataHelper.getJetpackHost();
const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const signupInboxId = config.get( 'signupInboxId' );

const createAndActivateAccount = async function ( driver, accountName ) {
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

describe( `[${ host }] Launch (${ screenSize }) @signup @parallel`, function () {
	this.timeout( mochaTimeOut );
	let driver;

	before( () => {
		driver = global.__BROWSER__;
	} );

	describe( 'Launch a free site', function () {
		const siteName = dataHelper.getNewBlogName();

		before( 'Can log in', async function () {
			const loginFlow = new LoginFlow( driver );
			await loginFlow.login();
		} );

		it( 'Can create a free site', async function () {
			return await new CreateSiteFlow( driver, siteName ).createFreeSite();
		} );

		it( 'Can launch a site', async function () {
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
	describe.skip( 'Launch when having multiple sites', function () {
		const accountName = dataHelper.getNewBlogName();
		const firstSiteName = dataHelper.getNewBlogName();
		const secondSiteName = dataHelper.getNewBlogName();

		before( 'Create 2 free sites as a new user', async function () {
			await createAndActivateAccount( driver, accountName );
			await new CreateSiteFlow( driver, firstSiteName ).createFreeSite();
			await new CreateSiteFlow( driver, secondSiteName ).createFreeSite();
		} );

		it( 'Can start launch flow and abandon', async function () {
			const myHomePage = await MyHomePage.Expect( driver );
			await myHomePage.launchSiteFromSiteSetup();
			await FindADomainComponent.Expect( driver );
			// force reloading the page from the server to simulate an expired cache
			await driver.executeScript( 'window.location.reload(true);' );
			await FindADomainComponent.Expect( driver );
			return await driver.navigate().back();
		} );

		it( 'Can switch sites and launch the first site', async function () {
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
