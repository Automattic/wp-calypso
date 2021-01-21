/**
 * External dependencies
 */
import config from 'config';
import assert from 'assert';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow.js';
import DeleteSiteFlow from '../lib/flows/delete-site-flow.js';
import NewPage from '../lib/pages/gutenboarding/new-page.js';
import AcquireIntentPage from '../lib/pages/gutenboarding/acquire-intent-page.js';
import DesignSelectorPage from '../lib/pages/gutenboarding/design-selector-page.js';
import StylePreviewPage from '../lib/pages/gutenboarding/style-preview-page.js';
import PlansPage from '../lib/pages/gutenboarding/plans-page.js';
import DomainsPage from '../lib/pages/gutenboarding/domains-page.js';
import FeaturesPage from '../lib/pages/gutenboarding/features-page.js';
import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component';
import LanguagePickerComponent from '../lib/components/gutenboarding-language-picker';

import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';
import * as driverHelper from '../lib/driver-helper.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe.skip( 'Gutenboarding: (' + screenSize + ')', function () {
	this.timeout( mochaTimeOut );
	describe( 'Create new site as existing user @parallel @canary', function () {
		const siteTitle = dataHelper.randomPhrase();
		const domainQuery = dataHelper.randomPhrase();
		let newSiteDomain = '';

		step( 'Can log in as user', async function () {
			await new LoginFlow( driver ).login();
		} );

		step( 'Can visit Gutenboarding page and see Onboarding block', async function () {
			const page = await NewPage.Visit(
				driver,
				NewPage.getGutenboardingURL( {
					query: 'flags=gutenboarding/language-picker',
				} )
			);
			const blockExists = await page.waitForBlock();
			assert( blockExists, 'Onboarding block is not rendered' );
		} );

		step( 'Can see Acquire Intent and set site title', async function () {
			const acquireIntentPage = await AcquireIntentPage.Expect( driver );
			await acquireIntentPage.enterSiteTitle( siteTitle );
		} );

		step( 'Can change language to Spanish and back to English', async function () {
			const acquireIntentPage = await AcquireIntentPage.Expect( driver );
			const languagePicker = await LanguagePickerComponent.Expect( driver );

			await languagePicker.switchLanguage( 'es' );

			await driverHelper.waitTillTextPresent(
				driver,
				acquireIntentPage.nextButtonSelector,
				'Continuar'
			);

			await languagePicker.switchLanguage( 'en' );

			await driverHelper.waitTillTextPresent(
				driver,
				acquireIntentPage.nextButtonSelector,
				'Continue'
			);

			await acquireIntentPage.goToNextStep();
		} );

		step( 'Can see Domains Page and pick a free domain and continue', async function () {
			const domainsPage = await DomainsPage.Expect( driver );
			await domainsPage.enterDomainQuery( domainQuery );
			newSiteDomain = await domainsPage.selectFreeDomain();
			await domainsPage.continueToNextStep();
		} );

		step( 'Can see Design Selector and select a random free design', async function () {
			const designSelectorPage = await DesignSelectorPage.Expect( driver );
			await designSelectorPage.selectFreeDesign();
		} );

		step( 'Can see Style Preview, choose a random font pairing, and continue', async function () {
			const stylePreviewPage = await StylePreviewPage.Expect( driver );
			await stylePreviewPage.selectFontPairing();
			await stylePreviewPage.continue();
		} );

		step(
			'Can see Feature picker and choose a feature that requires a business plan',
			async function () {
				const featuresPage = await FeaturesPage.Expect( driver );
				await featuresPage.selectPluginsFeature();
				await featuresPage.goToNextStep();
			}
		);

		step(
			'Can see Plans Grid with business plan recommended and can choose free plan',
			async function () {
				const plansPage = await PlansPage.Expect( driver );
				const recommendedPlan = await plansPage.getRecommendedPlan( driver );
				assert.strictEqual(
					recommendedPlan,
					'Business',
					'The Business plan should be recommended because the plugins feature was selected in the previous step'
				);
				await plansPage.expandAllPlans();
				await plansPage.selectFreePlan();
			}
		);

		step( 'Can see the gutenberg page editor', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.initEditor();
		} );

		after( 'Can delete site', async function () {
			await new DeleteSiteFlow( driver ).deleteSite( newSiteDomain );
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
