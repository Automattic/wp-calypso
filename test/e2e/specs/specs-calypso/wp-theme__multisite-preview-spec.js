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
	let loginFlow;
	let sidebarComponent;
	let themeSearchName;
	let expectedTheme;
	let themesPage;

	beforeAll( () => ( driver = global.__BROWSER__ ) );

	// TODO: Add test that verifies when visiting /themes,
	// you're asked to select a site before proceeding.
	// eslint-disable-next-line jest/no-disabled-tests
	it.skip( 'asks to select a site when visiting /themes logged in', async function () {
		loginFlow = new LoginFlow( driver, 'multiSiteUser' );
		await loginFlow.loginAndSelectAllSites();

		sidebarComponent = await SidebarComponent.Expect( driver );
		await sidebarComponent.selectAllSitesThemes();

		// Check to see if "choose a site" screen is shown
		// ? Unsure how to implement ?
	} );

	it( 'Login and select themes', async function () {
		themeSearchName = 'twenty';
		expectedTheme = 'Twenty F';

		loginFlow = new LoginFlow( driver, 'multiSiteUser' );
		await loginFlow.loginAndSelectMySite();

		sidebarComponent = await SidebarComponent.Expect( driver );
		await sidebarComponent.selectThemes();
	} );

	it( 'can search for free themes', async function () {
		themesPage = await ThemesPage.Expect( driver );
		await themesPage.waitUntilThemesLoaded();
		await themesPage.showOnlyFreeThemes();
		await themesPage.searchFor( themeSearchName );

		await themesPage.waitForThemeStartingWith( expectedTheme );
	} );

	it( 'click theme more button', async function () {
		await themesPage.clickNewThemeMoreButton();
	} );

	it( 'should show a menu', async function () {
		const displayed = await themesPage.popOverMenuDisplayed();
		assert( displayed, 'Popover menu not displayed' );
	} );
} );
