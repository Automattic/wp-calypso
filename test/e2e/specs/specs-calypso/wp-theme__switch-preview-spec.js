/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverManager from '../../lib/driver-manager.js';

import LoginFlow from '../../lib/flows/login-flow.js';

import ThemesPage from '../../lib/pages/themes-page.js';
import ThemePreviewPage from '../../lib/pages/theme-preview-page.js';
import ThemeDetailPage from '../../lib/pages/theme-detail-page.js';
import * as dataHelper from '../../lib/data-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Previewing Themes: (${ screenSize }) @parallel @jetpack`, function () {
	this.timeout( mochaTimeOut );

	it( 'Can login and select themes', async function () {
		const loginFlow = new LoginFlow( this.driver );
		await loginFlow.loginAndSelectThemes();
	} );

	it( 'Can select a different free theme', async function () {
		this.themesPage = await ThemesPage.Expect( this.driver );
		await this.themesPage.waitUntilThemesLoaded();
		await this.themesPage.showOnlyFreeThemes();
		await this.themesPage.searchFor( 'Twenty S' );
		await this.themesPage.waitForThemeStartingWith( 'Twenty S' );
		return await this.themesPage.selectNewThemeStartingWith( 'Twenty S' );
	} );

	it( 'Can see theme details page and open the live demo', async function () {
		this.themeDetailPage = await ThemeDetailPage.Expect( this.driver );
		return await this.themeDetailPage.openLiveDemo();
	} );

	it( 'Activate button appears on the theme preview page', async function () {
		this.themePreviewPage = await ThemePreviewPage.Expect( this.driver );
		await this.themePreviewPage.activateButtonVisible();
	} );
} );
