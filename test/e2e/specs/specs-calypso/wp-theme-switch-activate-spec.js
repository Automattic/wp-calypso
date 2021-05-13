/**
 * External dependencies
 */
import config from 'config';
import assert from 'assert';

/**
 * Internal dependencies
 */
import * as driverManager from '../../lib/driver-manager.js';

import LoginFlow from '../../lib/flows/login-flow.js';

import CustomizerPage from '../../lib/pages/customizer-page';
import ThemesPage from '../../lib/pages/themes-page.js';
import ThemeDialogComponent from '../../lib/components/theme-dialog-component.js';
import SidebarComponent from '../../lib/components/sidebar-component';
import WPAdminCustomizerPage from '../../lib/pages/wp-admin/wp-admin-customizer-page.js';
import WPAdminLogonPage from '../../lib/pages/wp-admin/wp-admin-logon-page.js';
import * as dataHelper from '../../lib/data-helper';

const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

// NOTE: test in jetpack env is failing due to some strange issue, when switching to new tab. It fails only in CI
describe( `[${ host }] Activating Themes: (${ screenSize }) @parallel`, function () {
	let driver;

	beforeAll( async function () {
		driver = await driverManager.startBrowser();
		await driverManager.clearCookiesAndDeleteLocalStorage( driver );
	}, startBrowserTimeoutMS );

	describe( 'Activating Themes:', function () {
		it( 'Login', async function () {
			const loginFlow = new LoginFlow( driver );
			return await loginFlow.loginAndSelectMySite( null, { useFreshLogin: true } );
		} );

		it( 'Can open Themes menu', async function () {
			const sidebarComponent = await SidebarComponent.Expect( driver );
			return await sidebarComponent.selectThemes();
		} );

		describe( 'Can switch free themes', function () {
			it( 'Can activate a different free theme', async function () {
				const themesPage = await ThemesPage.Expect( driver );
				await themesPage.waitUntilThemesLoaded();
				await themesPage.showOnlyFreeThemes();
				await themesPage.searchFor( 'Twenty F' );
				await themesPage.waitForThemeStartingWith( 'Twenty F' );
				await themesPage.clickNewThemeMoreButton();
				const displayed = await themesPage.popOverMenuDisplayed();
				assert( displayed, true, 'Popover menu not displayed' );
				return await themesPage.clickPopoverItem( 'Activate' );
			} );

			it( 'Can see the theme thanks dialog', async function () {
				const themeDialogComponent = await ThemeDialogComponent.Expect( driver );
				await themeDialogComponent.customizeSite();
			} );

			if ( host === 'WPCOM' ) {
				it( 'Can customize the site from the theme thanks dialog', async function () {
					return await CustomizerPage.Expect( driver );
				} );
			} else {
				it( 'Can log in via Jetpack SSO', async function () {
					const wpAdminLogonPage = await WPAdminLogonPage.Expect( driver );
					return await wpAdminLogonPage.logonSSO();
				} );

				it( 'Can customize the site from the theme thanks dialog', async function () {
					await WPAdminCustomizerPage.refreshIfJNError( driver );
					return await WPAdminCustomizerPage.Expect( driver );
				} );
			}
		} );
	} );
} );
