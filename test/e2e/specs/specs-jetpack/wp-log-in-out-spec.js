/**
 * External dependencies
 */
import config from 'config';

/**
 * External dependencies
 */
import * as driverManager from '../../lib/driver-manager.js';
import * as dataHelper from '../../lib/data-helper';

import ReaderPage from '../../lib/pages/reader-page';
import StatsPage from '../../lib/pages/stats-page';
import ProfilePage from '../../lib/pages/profile-page';

import NavBarComponent from '../../lib/components/nav-bar-component.js';
import LoggedOutMasterbarComponent from '../../lib/components/logged-out-masterbar-component';

import LoginFlow from '../../lib/flows/login-flow';
import WPAdminLogonPage from '../../lib/pages/wp-admin/wp-admin-logon-page.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Authentication: (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );
	let driver;

	before( 'Start browser', async function () {
		this.timeout( startBrowserTimeoutMS );
		driver = await driverManager.startBrowser();
	} );

	describe( 'Logging In and Out: @jetpack', function () {
		before( async function () {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		describe( 'Can Log In', function () {
			it( 'Can log in', async function () {
				const loginFlow = new LoginFlow( driver );
				await loginFlow.login( { useFreshLogin: true } );
			} );

			it( 'Can see Stats Page after logging in', async function () {
				return await StatsPage.Expect( driver );
			} );
		} );

		// Test Jetpack SSO
		if ( host !== 'WPCOM' ) {
			describe( 'Can Log via Jetpack SSO', function () {
				it( 'Can log into site via Jetpack SSO', async function () {
					const loginPage = await WPAdminLogonPage.Visit( driver, dataHelper.getJetpackSiteName() );
					return await loginPage.logonSSO();
				} );

				it( 'Can return to Reader', async function () {
					return await ReaderPage.Visit( driver );
				} );
			} );
		}

		describe( 'Can Log Out', function () {
			it( 'Can view profile to log out', async function () {
				const navbarComponent = await NavBarComponent.Expect( driver );
				await navbarComponent.clickProfileLink();
			} );

			it( 'Can logout from profile page', async function () {
				const profilePage = await ProfilePage.Expect( driver );
				await profilePage.clickSignOut();
			} );

			it( 'Can see wordpress.com home when after logging out', async function () {
				return await LoggedOutMasterbarComponent.Expect( driver );
			} );
		} );
	} );
} );
