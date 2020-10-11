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
import DomainsPage from '../lib/pages/gutenboarding/domains-page.js';
import FeaturesPage from '../lib/pages/gutenboarding/features-page.js';

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
			assert( blockExists, 'Onboarding block is not rendered' );
		} );

		step( 'Can see Acquire Intent and set site title', async function () {
			const acquireIntentPage = await AcquireIntentPage.Expect( driver );
			await acquireIntentPage.enterSiteTitle( siteTitle );
			await acquireIntentPage.goToNextStep();
		} );

		step( 'Can see Domains Page and pick a free domain and continue', async function () {
			const domainsPage = await DomainsPage.Expect( driver );
			await domainsPage.selectFreeDomain();
			await domainsPage.continueToNextStep();
		} );

		step( 'Can see Design Selector and select a random free design', async function () {
			const designSelectorPage = await DesignSelectorPage.Expect( driver );
			await designSelectorPage.selectFreeDesign();
		} );

		step( 'Can see Style Preview and continue', async function () {
			const stylePreviewPage = await StylePreviewPage.Expect( driver );
			await stylePreviewPage.continue();
		} );

		step( 'Can see Feature picker and skip', async function () {
			const featureswPage = await FeaturesPage.Expect( driver );
			await featureswPage.skipStep();
		} );

		step( 'Can see Plans Grid with no selected plan', async function () {
			const plansPage = await PlansPage.Expect( driver );
			const hasSelectedPlan = await plansPage.hasSelectedPlan();
			assert.strictEqual( hasSelectedPlan, false, 'There is a preselected plan' );
		} );
	} );

	describe( 'Visit Gutenboarding page as a logged in user', function () {
		step( 'Can log in as user', async function () {
			this.loginFlow = new LoginFlow( driver );
			this.loginFlow.login();
		} );
		step( 'Can visit Gutenboarding', async function () {
			await NewPage.Visit( driver );
		} );
	} );

	describe( 'Skip first step in Gutenboarding, select paid design and see Domains page after Style preview @parallel', function () {
		before( async function () {
			await driverManager.ensureNotLoggedIn( driver );
			await NewPage.Visit( driver );
		} );

		step( 'Can skip Acquire Intent step', async function () {
			const acquireIntentPage = await AcquireIntentPage.Expect( driver );
			await acquireIntentPage.skipStep();
		} );

		step( 'Can see Design Selector and select a random paid design', async function () {
			const designSelectorPage = await DesignSelectorPage.Expect( driver );
			await designSelectorPage.selectPaidDesign();
		} );

		step( 'Can see Style Preview and continue', async function () {
			const stylePreviewPage = await StylePreviewPage.Expect( driver );
			await stylePreviewPage.continue();
		} );

		step( 'Can see Domain Picker in an empty state', async function () {
			const domainPickerPage = await DomainsPage.Expect( driver );
			const isEmptyState = await domainPickerPage.isInEmptyState();
			assert.strictEqual( isEmptyState, true, 'Domain picker should be in empty state' );
		} );
	} );
} );
