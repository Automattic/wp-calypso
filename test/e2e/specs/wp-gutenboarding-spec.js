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
import PlansPage from '../lib/pages/gutenboarding/plans-page.js';

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
			await acquireIntentPage.enterSiteTitle( siteTitle );
			return await acquireIntentPage.goToNextStep();
		} );

		step( 'Can see Design Selector and select a random free design', async function () {
			const designSelectorPage = await DesignSelectorPage.Expect( driver );
			return await designSelectorPage.selectFreeDesign();
		} );

		step( 'Can see Style Preview and continue', async function () {
			const stylePreviewPage = await StylePreviewPage.Expect( driver );
			return await stylePreviewPage.continue();
		} );

		step( 'Can see Plans Grid with no selected plan', async function () {
			const plansPage = await PlansPage.Expect( driver );
			const hasSelectedPlan = await plansPage.hasSelectedPlan();

			return assert.strictEqual( hasSelectedPlan, false, 'There is a preselected plan' );
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

	describe( 'Skip first step in Gutenboarding and select paid design @parallel', function () {
		before( async function () {
			await driverManager.ensureNotLoggedIn( driver );
			await NewPage.Visit( driver );
		} );

		step( 'Can skip Acquire Intent step', async function () {
			const acquireIntentPage = await AcquireIntentPage.Expect( driver );
			return await acquireIntentPage.skipStep();
		} );

		step( 'Can see Design Selector and select a random paid design', async function () {
			const designSelectorPage = await DesignSelectorPage.Expect( driver );
			return await designSelectorPage.selectPaidDesign();
		} );

		step( 'Can see Plans Grid with a pre-selected plan', async function () {
			const stylePreviewPage = await StylePreviewPage.Expect( driver );
			await stylePreviewPage.continue();
			const plansPage = await PlansPage.Expect( driver );
			const hasSelectedPlan = await plansPage.hasSelectedPlan();
			return assert.strictEqual( hasSelectedPlan, true, 'There is no pre-selected plan' );
		} );
	} );
} );
