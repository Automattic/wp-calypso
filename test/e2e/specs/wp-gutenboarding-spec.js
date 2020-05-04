/**
 * External dependencies
 */
import config from 'config';
import assert from 'assert';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow.js';
import NewPage from '../lib/pages/gutenboarding/new-page.js';
import AcquireIntentPage from '../lib/pages/gutenboarding/acquire-intent-page.js';
import DesignSelectorPage from '../lib/pages/gutenboarding/design-selector-page.js';
import StylePreviewPage from '../lib/pages/gutenboarding/style-preview-page.js';

import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( 'Gutenboarding: (' + screenSize + ')', function () {
	this.timeout( mochaTimeOut );
	describe( 'Visit Gutenboarding page as a new user @parallel @canary', function () {
		const vertical = dataHelper.randomPhrase();
		const siteTitle = dataHelper.randomPhrase();

		before( async function () {
			await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can visit Gutenboarding page and see Onboarding block', async function () {
			const page = await NewPage.Visit( driver );
			const blockExists = await page.waitForBlock();
			return assert( blockExists, 'Onboarding block is not rendered' );
		} );

		step( 'Can see Acquire Intent and set a vertical and site title', async function () {
			const acquireIntentPage = await AcquireIntentPage.Expect( driver );
			await acquireIntentPage.enterVertical( vertical );
			await acquireIntentPage.enterSiteTitle( siteTitle );
			return await acquireIntentPage.goToNextStep();
		} );

		step( 'Can see Design Selector and select one design', async function () {
			const designSelectorPage = await DesignSelectorPage.Expect( driver );
			const designOptionsCount = await designSelectorPage.getDesignOptionsCount();
			return await designSelectorPage.selectDesign(
				dataHelper.getRandomInt( 1, designOptionsCount )
			);
		} );

		step( 'Can see Style Preview and continue to site creation', async function () {
			const stylePreviewPage = await StylePreviewPage.Expect( driver );
			return await stylePreviewPage.continueToCreateSite();
		} );
	} );

	describe( 'Visit Gutenboarding page as a logged in user', function () {
		step( 'Can log in as user', async function () {
			this.loginFlow = new LoginFlow( driver );
			return this.loginFlow.login();
		} );
		step( 'Can visit Gutenboarding', async function () {
			await NewPage.Visit( driver );
		} );
	} );
} );
