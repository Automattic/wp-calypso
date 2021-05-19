/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverManager from '../../lib/driver-manager.js';
import * as dataHelper from '../../lib/data-helper';

import ThemesPage from '../../lib/pages/themes-page.js';
import CustomizerPage from '../../lib/pages/customizer-page.js';

import SidebarComponent from '../../lib/components/sidebar-component';
import SiteSelectorComponent from '../../lib/components/site-selector-component';

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

	describe( 'Preview a theme @parallel', function () {
		this.timeout( mochaTimeOut );

		it( 'Login and select themes', async function () {
			this.themeSearchName = 'twenty';
			this.expectedTheme = 'Twenty F';

			this.loginFlow = new LoginFlow( driver, 'multiSiteUser' );
			await this.loginFlow.loginAndSelectAllSites();

			this.sidebarComponent = await SidebarComponent.Expect( driver );
			await this.sidebarComponent.selectAllSitesThemes();
		} );

		it( 'can search for free themes', async function () {
			this.themesPage = await ThemesPage.Expect( driver );
			await this.themesPage.waitUntilThemesLoaded();
			await this.themesPage.showOnlyFreeThemes();
			await this.themesPage.searchFor( this.themeSearchName );

			await this.themesPage.waitForThemeStartingWith( this.expectedTheme );
		} );

		describe( 'when a theme more button is clicked', function () {
			it( 'click theme more button', async function () {
				await this.themesPage.clickNewThemeMoreButton();
			} );

			it( 'should show a menu', async function () {
				const displayed = await this.themesPage.popOverMenuDisplayed();
				assert( displayed, 'Popover menu not displayed' );
			} );

			describe.skip( 'when "Try & Customize" is clicked', function () {
				it( 'click try and customize popover', async function () {
					await this.themesPage.clickPopoverItem( 'Try & Customize' );
					this.siteSelector = await SiteSelectorComponent.Expect( driver );
				} );

				it( 'should show the site selector', async function () {
					const siteSelectorShown = await this.siteSelector.displayed();
					return assert( siteSelectorShown, 'The site selector was not shown' );
				} );

				describe( 'when a site is selected, and Customize is clicked', function () {
					it( 'select first site', async function () {
						await this.siteSelector.selectFirstSite();
						await this.siteSelector.ok();
					} );

					it( 'should open the customizer with the selected site and theme', async function () {
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
} );
