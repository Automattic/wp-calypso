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
import DesignLocatorPage from '../lib/pages/gutenboarding/designs-page.js';
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

describe( 'Gutenboarding: (' + screenSize + ')', function () {
	this.timeout( mochaTimeOut );
	let driver;

	before( 'Start browser', async function () {
		this.timeout( startBrowserTimeoutMS );
		driver = await driverManager.startBrowser();
	} );

	describe( 'Create new site as existing user @parallel @canary', function () {
		const siteTitle = dataHelper.randomPhrase();
		const domainQuery = dataHelper.randomPhrase();
		let newSiteDomain = '';

		it( 'Can log in as user', async function () {
			await new LoginFlow( driver ).login();
		} );

		it( 'Can visit Gutenboarding page and see Onboarding block', async function () {
			const page = await NewPage.Visit( driver, NewPage.getGutenboardingURL() );
			const blockExists = await page.waitForBlock();
			assert( blockExists, 'Onboarding block is not rendered' );
		} );

		it( 'Can see Acquire Intent and set site title', async function () {
			const acquireIntentPage = await AcquireIntentPage.Expect( driver );
			await acquireIntentPage.enterSiteTitle( siteTitle );
		} );

		it( 'Can change language to Spanish and back to English', async function () {
			const acquireIntentPage = await AcquireIntentPage.Expect( driver );
			const languagePicker = await LanguagePickerComponent.Expect( driver );

			await languagePicker.switchLanguage( 'es' );

			await driverHelper.waitTillTextPresent(
				driver,
				acquireIntentPage.nextButtonLocator,
				'Continuar'
			);

			await languagePicker.switchLanguage( 'en' );

			await driverHelper.waitTillTextPresent(
				driver,
				acquireIntentPage.nextButtonLocator,
				'Continue'
			);

			await acquireIntentPage.goToNextStep();
		} );

		it( 'Can see Domains Page, search for domains, pick a free domain, and continue', async function () {
			const domainsPage = await DomainsPage.Expect( driver );
			await domainsPage.enterDomainQuery( domainQuery );
			await domainsPage.waitForDomainSuggestionsToLoad();
			newSiteDomain = await domainsPage.getFreeDomainName();
			await domainsPage.selectFreeDomain();
			await domainsPage.continueToNextStep();
		} );

		it( 'Can see Design Locator and select a random free design', async function () {
			const designLocatorPage = await DesignLocatorPage.Expect( driver );
			await designLocatorPage.selectFreeDesign();
		} );

		it( 'Can see Style Preview, choose a random font pairing, and continue', async function () {
			const stylePreviewPage = await StylePreviewPage.Expect( driver );
			await stylePreviewPage.selectFontPairing();
			await stylePreviewPage.continue();
		} );

		it( 'Can see Feature picker and choose a feature that requires a business plan', async function () {
			const featuresPage = await FeaturesPage.Expect( driver );
			await featuresPage.selectPluginsFeature();
			await featuresPage.goToNextStep();
		} );

		it( 'Can see Plans Grid with business plan recommended and can choose free plan', async function () {
			const plansPage = await PlansPage.Expect( driver );
			const recommendedPlan = await plansPage.getRecommendedPlan( driver );
			assert.strictEqual(
				recommendedPlan,
				'Business',
				'The Business plan should be recommended because the plugins feature was selected in the previous step'
			);
			await plansPage.expandAllPlans();
			await plansPage.selectFreePlan();

			// Redirect console messages that starts with "onboarding-debug" to E2E log.
			await driver
				.manage()
				.logs()
				.get( 'browser' )
				.then( function ( logs ) {
					logs.forEach( ( log ) => {
						if ( log.message.indexOf( 'onboarding-debug' ) > -1 ) {
							console.log( log.message );
						}
					} );
				} );
		} );

		it( 'Can see the gutenberg page editor', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.initEditor();
		} );

		after( 'Can delete site', async function () {
			await new DeleteSiteFlow( driver ).deleteSite( newSiteDomain );
		} );
	} );

	describe( 'Visit Gutenboarding page as a logged in user @parallel', function () {
		it( 'Can log in as user', async function () {
			await new LoginFlow( driver ).login();
		} );

		it( 'Can visit Gutenboarding', async function () {
			await NewPage.Visit( driver );
		} );
	} );
} );
