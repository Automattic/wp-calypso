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

import SidebarComponent from '../../lib/components/sidebar-component';

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

	// TODO: Add test that verifies when visiting /themes,
	// you're asked to select a site before proceeding. (in new file? All @parallel tests are split)
	/*
	describe( 'Visiting /themes in the context of all sites asks to select a site @parallel', function () {
		this.timeout( mochaTimeOut );
		it( 'asks to select a site when visiting /themes logged in', async function () {
			this.loginFlow = new LoginFlow( driver, 'multiSiteUser' );
			await this.loginFlow.loginAndSelectAllSites();

			this.sidebarComponent = await SidebarComponent.Expect( driver );
			await this.sidebarComponent.selectAllSitesThemes();

            // Check to see if "choose a site" screen is shown
		} );
	} );
    */

	describe( 'Preview a theme @parallel', function () {
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
		} );

		describe( 'when a theme more button is clicked', function () {
			it( 'click theme more button', async function () {
				await this.themesPage.clickNewThemeMoreButton();
			} );

			it( 'should show a menu', async function () {
				const displayed = await this.themesPage.popOverMenuDisplayed();
				assert( displayed, 'Popover menu not displayed' );
			} );

			// Try & Customize had a skipped test that relied on the
			// now removed SiteSelectorModal - make a new Try & Customize test?
		} );
	} );
} );
