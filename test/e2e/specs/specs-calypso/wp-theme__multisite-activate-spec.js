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
import SiteSelectorComponent from '../../lib/components/site-selector-component';
import LoginFlow from '../../lib/flows/login-flow.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Themes: Activate a theme, all sites (${ screenSize }) @parallel`, function () {
	this.timeout( mochaTimeOut );
	const driver = global.__BROWSER__;

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

		this.currentThemeName = await this.themesPage.getFirstThemeName();
	} );

	it( 'click new theme more button', async function () {
		await this.themesPage.clickNewThemeMoreButton();
	} );

	it( 'should show a menu', async function () {
		const displayed = await this.themesPage.popOverMenuDisplayed();
		assert( displayed, 'Popover menu not displayed' );
	} );

	it( 'can click activate', async function () {
		await this.themesPage.clickPopoverItem( 'Activate' );
		return ( this.siteSelector = await SiteSelectorComponent.Expect( driver ) );
	} );

	it( 'shows the site selector', async function () {
		const siteSelectorShown = await this.siteSelector.displayed();
		return assert( siteSelectorShown, 'The site selector was not shown' );
	} );

	it( 'can select the first site sites', async function () {
		await this.siteSelector.selectFirstSite();
		return await this.siteSelector.ok();
	} );
} );
