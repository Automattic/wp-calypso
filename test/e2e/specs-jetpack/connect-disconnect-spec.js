/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow';
import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';
import PickAPlanPage from '../lib/pages/signup/pick-a-plan-page';
import WPAdminJetpackPage from '../lib/pages/wp-admin/wp-admin-jetpack-page.js';
import WPAdminLogonPage from '../lib/pages/wp-admin/wp-admin-logon-page';
import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar.js';
import JetpackConnectFlow from '../lib/flows/jetpack-connect-flow';
import WPAdminPostsPage from '../lib/pages/wp-admin/wp-admin-posts-page';
import WPAdminDashboardPage from '../lib/pages/wp-admin/wp-admin-dashboard-page';
import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const jetpackUser = process.env.JETPACKUSER;
const user = dataHelper.getAccountConfig( jetpackUser );
let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( 'Disconnect wporg site', function () {
	this.timeout( mochaTimeOut );

	step( 'Can disconnect wporg site', async function () {
		await driverManager.clearCookiesAndDeleteLocalStorage( driver, user[ 2 ] );
		await new JetpackConnectFlow( driver, 'jetpackConnectUser' ).disconnectFromWPAdmin(
			jetpackUser
		);
		await driverManager.clearCookiesAndDeleteLocalStorage( driver, user[ 2 ] );
	} );
} );

describe( `Jetpack Connect and Disconnect: (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	before( async function () {
		return await driverManager.ensureNotLoggedIn( driver );
	} );

	describe( 'Connect Jetpack and see if post page is loading correctly', function () {
		step( 'Can login into WordPress.com', async function () {
			const loginFlow = new LoginFlow( driver, 'jetpackConnectUser' );
			return await loginFlow.login();
		} );

		step( 'Login into wporg site', async function () {
			const loginPage = await WPAdminLogonPage.Visit( driver, user[ 2 ] );
			await loginPage.login( user[ 0 ], user[ 1 ] );
		} );

		step( 'Can navigate to the Jetpack dashboard', async function () {
			const wpAdminSidebar = await WPAdminSidebar.Expect( driver );
			return await wpAdminSidebar.selectJetpack();
		} );

		step( 'Can click the Connect Jetpack button', async function () {
			const wpAdminJetpack = await WPAdminJetpackPage.Expect( driver );
			return await wpAdminJetpack.connectWordPressCom();
		} );

		step( 'Can approve connection on the authorization page', async function () {
			const jetpackAuthorizePage = await JetpackAuthorizePage.Expect( driver );
			return await jetpackAuthorizePage.approveConnection();
		} );

		step( 'Can click the free plan button', async function () {
			// Some of the users are not the plan owners, so skipping this step for them
			if (
				[ 'siteGroundJetpackUser', 'bluehostJetpackUserSub', 'goDaddyJetpackUserSub' ].includes(
					jetpackUser
				)
			) {
				return await WPAdminDashboardPage.Visit( driver, user[ 2 ] );
			}
			const pickAPlanPage = await PickAPlanPage.Expect( driver );
			return await pickAPlanPage.selectFreePlanJetpack();
		} );

		step( 'Can navigate to the Posts page', async function () {
			const wpAdminSidebar = await WPAdminSidebar.Expect( driver );
			return await wpAdminSidebar.selectAllPosts();
		} );

		step( 'Can load a post and make sure it is loaded correctly', async function () {
			const postsPage = await WPAdminPostsPage.Expect( driver );
			return await postsPage.viewFirstPost();
		} );
	} );

	describe( 'Disconnect from Jetpack and load a post page', function () {
		step( 'Can disconnect Jetpack connection in wp-admin', async function () {
			await driverManager.clearCookiesAndDeleteLocalStorage( driver, user[ 2 ] );
			await new JetpackConnectFlow( driver, 'jetpackConnectUser' ).disconnectFromWPAdmin(
				jetpackUser
			);
		} );

		step( 'Can navigate to the Posts page', async function () {
			const wpAdminSidebar = await WPAdminSidebar.Expect( driver );
			return await wpAdminSidebar.selectAllPosts();
		} );

		step( 'Can load a post and make sure it is loaded correctly', async function () {
			const postsPage = await WPAdminPostsPage.Expect( driver );
			return await postsPage.viewFirstPost();
		} );
	} );
} );
