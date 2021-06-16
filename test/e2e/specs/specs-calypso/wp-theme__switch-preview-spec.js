/**
 * Internal dependencies
 */
import * as driverManager from '../../lib/driver-manager.js';

import LoginFlow from '../../lib/flows/login-flow.js';

import ThemesPage from '../../lib/pages/themes-page.js';
import ThemePreviewPage from '../../lib/pages/theme-preview-page.js';
import ThemeDetailPage from '../../lib/pages/theme-detail-page.js';
import * as dataHelper from '../../lib/data-helper';

const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Previewing Themes: (${ screenSize }) @parallel @jetpack`, function () {
	let driver;

	beforeAll( () => ( driver = global.__BROWSER__ ) );

	it( 'Can login and select themes', async function () {
		const loginFlow = new LoginFlow( driver );
		await loginFlow.loginAndSelectThemes();
	} );

	it( 'Can select a different free theme', async function () {
		const themesPage = await ThemesPage.Expect( driver );
		await themesPage.waitUntilThemesLoaded();
		await themesPage.showOnlyFreeThemes();
		await themesPage.searchFor( 'Twenty S' );
		await themesPage.waitForThemeStartingWith( 'Twenty S' );
		return await themesPage.selectNewThemeStartingWith( 'Twenty S' );
	} );

	it( 'Can see theme details page and open the live demo', async function () {
		const themeDetailPage = await ThemeDetailPage.Expect( driver );
		return await themeDetailPage.openLiveDemo();
	} );

	it( 'Activate button appears on the theme preview page', async function () {
		const themePreviewPage = await ThemePreviewPage.Expect( driver );
		await themePreviewPage.activateButtonVisible();
	} );
} );
