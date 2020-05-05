/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper';

import ThemeDetailPage from '../lib/pages/theme-detail-page.js';
import ThemesPage from '../lib/pages/themes-page.js';
import CustomizerPage from '../lib/pages/customizer-page.js';

import SidebarComponent from '../lib/components/sidebar-component';
import SiteSelectorComponent from '../lib/components/site-selector-component';
import ThemeDialogComponent from '../lib/components/theme-dialog-component';
import CurrentThemeComponent from '../lib/components/current-theme-component';

import LoginFlow from '../lib/flows/login-flow.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Themes: All sites (${ screenSize })`, function () {
	describe( 'Preview a theme @parallel', function () {
		this.timeout( mochaTimeOut );

		step( 'Login and select themes', async function () {
			this.themeSearchName = 'twenty';
			this.expectedTheme = 'Twenty F';

			this.loginFlow = new LoginFlow( driver, 'multiSiteUser' );
			await this.loginFlow.loginAndSelectAllSites();

			this.sidebarComponent = await SidebarComponent.Expect( driver );
			await this.sidebarComponent.selectThemes();
		} );

		step( 'can search for free themes', async function () {
			this.themesPage = await ThemesPage.Expect( driver );
			await this.themesPage.waitUntilThemesLoaded();
			await this.themesPage.showOnlyFreeThemes();
			await this.themesPage.searchFor( this.themeSearchName );

			await this.themesPage.waitForThemeStartingWith( this.expectedTheme );
		} );

		describe( 'when a theme more button is clicked', function () {
			step( 'click theme more button', async function () {
				await this.themesPage.clickNewThemeMoreButton();
			} );

			step( 'should show a menu', async function () {
				const displayed = await this.themesPage.popOverMenuDisplayed();
				assert( displayed, 'Popover menu not displayed' );
			} );

			describe( 'when "Try & Customize" is clicked', function () {
				step( 'click try and customize popover', async function () {
					await this.themesPage.clickPopoverItem( 'Try & Customize' );
					this.siteSelector = await SiteSelectorComponent.Expect( driver );
				} );

				step( 'should show the site selector', async function () {
					const siteSelectorShown = await this.siteSelector.displayed();
					return assert( siteSelectorShown, 'The site selector was not shown' );
				} );

				describe( 'when a site is selected, and Customize is clicked', function () {
					step( 'select first site', async function () {
						await this.siteSelector.selectFirstSite();
						await this.siteSelector.ok();
					} );

					step( 'should open the customizer with the selected site and theme', async function () {
						this.customizerPage = await CustomizerPage.Expect( driver );
						const url = await driver.getCurrentUrl();
						assert( url.indexOf( this.siteSelector.selectedSiteDomain ) > -1, 'Wrong site domain' );
						assert( url.indexOf( this.themeSearchName ) > -1, 'Wrong theme' );
					} );

					after( async function () {
						await this.customizerPage.close();
					} );
				} );
			} );
		} );
	} );

	describe( 'Activate a theme @parallel', function () {
		this.timeout( mochaTimeOut );

		step( 'Login and select themes', async function () {
			this.themeSearchName = 'twenty';
			this.expectedTheme = 'Twenty F';

			this.loginFlow = new LoginFlow( driver, 'multiSiteUser' );
			await this.loginFlow.loginAndSelectAllSites();

			this.sidebarComponent = await SidebarComponent.Expect( driver );
			await this.sidebarComponent.selectThemes();
		} );

		step( 'can search for free themes', async function () {
			this.themesPage = await ThemesPage.Expect( driver );
			await this.themesPage.waitUntilThemesLoaded();
			await this.themesPage.showOnlyFreeThemes();
			await this.themesPage.searchFor( this.themeSearchName );
			await this.themesPage.waitForThemeStartingWith( this.expectedTheme );

			this.currentThemeName = await this.themesPage.getFirstThemeName();
		} );

		describe( 'when a theme more button is clicked', function () {
			step( 'click new theme more button', async function () {
				await this.themesPage.clickNewThemeMoreButton();
			} );

			step( 'should show a menu', async function () {
				const displayed = await this.themesPage.popOverMenuDisplayed();
				assert( displayed, 'Popover menu not displayed' );
			} );

			describe( 'when Activate is clicked', function () {
				step( 'can click activate', async function () {
					await this.themesPage.clickPopoverItem( 'Activate' );
					return ( this.siteSelector = await SiteSelectorComponent.Expect( driver ) );
				} );

				step( 'shows the site selector', async function () {
					const siteSelectorShown = await this.siteSelector.displayed();
					return assert( siteSelectorShown, 'The site selector was not shown' );
				} );

				step( 'can select the first site sites', async function () {
					await this.siteSelector.selectFirstSite();
					return await this.siteSelector.ok();
				} );

				describe( 'Successful activation dialog', function () {
					step( 'should show the successful activation dialog', async function () {
						const themeDialogComponent = await ThemeDialogComponent.Expect( driver );
						return await themeDialogComponent.goToThemeDetail();
					} );

					step( 'should show the correct theme in the current theme bar', async function () {
						this.themeDetailPage = await ThemeDetailPage.Expect( driver );
						await this.themeDetailPage.goBackToAllThemes();
						this.currentThemeComponent = await CurrentThemeComponent.Expect( driver );
						const name = await this.currentThemeComponent.getThemeName();
						return assert.strictEqual( name, this.currentThemeName );
					} );

					step( 'should highlight the current theme as active', async function () {
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
