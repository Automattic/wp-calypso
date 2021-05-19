/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';
import { By } from 'selenium-webdriver';
import * as driverHelper from '../lib/driver-helper';

/**
 * Internal dependencies
 */
import * as driverManager from '../../lib/driver-manager.js';
import * as dataHelper from '../../lib/data-helper';

import ThemeDetailPage from '../../lib/pages/theme-detail-page.js';
import ThemesPage from '../../lib/pages/themes-page.js';

import SidebarComponent from '../../lib/components/sidebar-component';
import ThemeDialogComponent from '../../lib/components/theme-dialog-component';
import CurrentThemeComponent from '../../lib/components/current-theme-component';

import LoginFlow from '../../lib/flows/login-flow.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Themes: All sites (${ screenSize })`, function () {
	let driver;

	before( async function () {
		this.timeout( startBrowserTimeoutMS );
		driver = await driverManager.startBrowser();
	} );

	describe( 'Activate a theme @parallel', function () {
		this.timeout( mochaTimeOut );

		it( 'Login and select themes', async function () {
			this.themeSearchName = 'twenty';
			this.expectedTheme = 'Twenty F';

			this.loginFlow = new LoginFlow( driver, 'multiSiteUser' );
			await this.loginFlow.loginAndSelectMySite();

			this.sidebarComponent = await SidebarComponent.Expect( driver );
			await this.sidebarComponent.selectThemes();
		} );

		it( 'can search for free themes', async function () {
			this.themesPage = await ThemesPage.Expect( driver );
			await this.themesPage.waitUntilThemesLoaded();
			await this.themesPage.showOnlyFreeThemes();
			await this.themesPage.searchFor( this.themeSearchName );
			await this.themesPage.waitForThemeStartingWith( this.expectedTheme );

			this.currentThemeName = await this.themesPage.getFirstThemeName();
		} );

		describe( 'when a theme more button is clicked', function () {
			it( 'click new theme more button', async function () {
				await this.themesPage.clickNewThemeMoreButton();
			} );

			it( 'should show a menu', async function () {
				const displayed = await this.themesPage.popOverMenuDisplayed();
				assert( displayed, 'Popover menu not displayed' );
			} );

			describe( 'when Activate is clicked', function () {
				it( 'can click activate and see the success modal', async function () {
					await this.themesPage.clickPopoverItem( 'Activate' );
					const thanksModalShown = await driverHelper.isElementEventuallyLocatedAndVisible(
						driver,
						By.css( '.themes__thanks-modal' )
					);
					return assert(
						thanksModalShown,
						"The 'Thanks for Choosing Twenty Sixteen' modal was not displayed after activating"
					);
				} );

				// Some tests about activating a theme in the context of "All Sites" were
				// removed - check git history. Visiting "/themes" while logged out should now
				// force you to select a site before proceeding. You'll be redirected to
				// "/themes/<site>" and be operating only in the context of one site.

				// Skip reason: https://github.com/Automattic/wp-calypso/issues/50130
				// Note this was disabled before the "All Sites" change mentioned
				// directly above.
				describe.skip( 'Successful activation dialog', function () {
					it( 'should show the successful activation dialog', async function () {
						const themeDialogComponent = await ThemeDialogComponent.Expect( driver );
						return await themeDialogComponent.goToThemeDetail();
					} );

					it( 'should show the correct theme in the current theme bar', async function () {
						this.themeDetailPage = await ThemeDetailPage.Expect( driver );
						await this.themeDetailPage.goBackToAllThemes();
						this.currentThemeComponent = await CurrentThemeComponent.Expect( driver );
						const name = await this.currentThemeComponent.getThemeName();
						return assert.strictEqual( name, this.currentThemeName );
					} );

					it( 'should highlight the current theme as active', async function () {
						await this.themesPage.clearSearch();
						await this.themesPage.searchFor( this.themeSearchName );
						const name = await this.themesPage.getActiveThemeName();
						return assert.strictEqual( name, this.currentThemeName );
					} );
				} );
			} );
		} );
	} );
} );
