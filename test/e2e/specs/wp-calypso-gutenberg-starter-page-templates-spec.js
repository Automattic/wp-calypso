/** @format */

/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow.js';

import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';
import * as driverHelper from '../lib/driver-helper';
import ThemesPage from '../lib/pages/themes-page.js';
import ThemeDetailPage from '../lib/pages/theme-detail-page.js';
import PagesPage from '../lib/pages/pages-page';
import SidebarComponent from '../lib/components/sidebar-component.js';
import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

const host = dataHelper.getJetpackHost();

let driver;

before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( 'Starter Templates: @parallel', function() {
	this.timeout( mochaTimeOut );

	step( 'Can see Template selector', async function() {
		const templateSelectorCSSSelector = '.page-template-modal';
		this.loginFlow = new LoginFlow( driver, 'gutenbergSimpleSiteUser' );

		if ( host !== 'WPCOM' ) {
			this.loginFlow = new LoginFlow( driver );
		}

		await this.loginFlow.loginAndSelectThemes();

		const themesPage = await ThemesPage.Expect( driver );
		await themesPage.waitUntilThemesLoaded();

		// await themesPage.waitForThemeStartingWith( 'Modern Business' );
		const activeTheme = await themesPage.getActiveThemeName();

		if ( 'Modern Business' !== activeTheme ) {
			await themesPage.searchFor( 'Modern Business' );
			await themesPage.selectNewThemeStartingWith( 'Modern Business' );

			const themeDetailPage = await ThemeDetailPage.Expect( driver );
			themeDetailPage.pickThisDesign();
		}

		const sidebarComponent = await SidebarComponent.Expect( driver );
		await sidebarComponent.selectPages();

		const pagesPage = await PagesPage.Expect( driver );
		await pagesPage.selectAddNewPage();

		await GutenbergEditorComponent.Expect( driver );

		const isOverlayPresent = await driverHelper.isEventuallyPresentAndDisplayed(
			driver,
			By.css( templateSelectorCSSSelector )
		);

		assert.equal( isOverlayPresent, true );
	} );
} );
