/**
 * External dependencies
 */
import assert from 'assert';

/**
 * Internal dependencies
 */
import * as driverManager from '../../lib/driver-manager.js';
import * as dataHelper from '../../lib/data-helper';

import ThemesPage from '../../lib/pages/themes-page.js';
import SidebarComponent from '../../lib/components/sidebar-component';
import LoginFlow from '../../lib/flows/login-flow.js';

const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Themes: Preview a theme, all sites (${ screenSize }) @parallel`, function () {
	let driver;

	beforeAll( () => ( driver = global.__BROWSER__ ) );

	// TODO: Add test that verifies when visiting /themes,
	// you're asked to select a site before proceeding.
	// eslint-disable-next-line jest/no-disabled-tests
	it.skip( 'asks to select a site when visiting /themes logged in', async function () {
		this.loginFlow = new LoginFlow( driver, 'multiSiteUser' );
		await this.loginFlow.loginAndSelectAllSites();

		this.sidebarComponent = await SidebarComponent.Expect( driver );
		await this.sidebarComponent.selectAllSitesThemes();

		// Check to see if "choose a site" screen is shown
		// ? Unsure how to implement ?
	} );

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

	it( 'click theme more button', async function () {
		await this.themesPage.clickNewThemeMoreButton();
	} );

	it( 'should show a menu', async function () {
		const displayed = await this.themesPage.popOverMenuDisplayed();
		assert( displayed, 'Popover menu not displayed' );
	} );
} );
