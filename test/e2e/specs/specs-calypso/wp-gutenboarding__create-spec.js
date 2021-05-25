/**
 * External dependencies
 */
import config from 'config';
import assert from 'assert';

/**
 * Internal dependencies
 */
import LoginFlow from '../../lib/flows/login-flow.js';
import DeleteSiteFlow from '../../lib/flows/delete-site-flow.js';
import NewPage from '../../lib/pages/gutenboarding/new-page.js';
import AcquireIntentPage from '../../lib/pages/gutenboarding/acquire-intent-page.js';
import DesignLocatorPage from '../../lib/pages/gutenboarding/designs-page.js';
import StylePreviewPage from '../../lib/pages/gutenboarding/style-preview-page.js';
import PlansPage from '../../lib/pages/gutenboarding/plans-page.js';
import DomainsPage from '../../lib/pages/gutenboarding/domains-page.js';
import FeaturesPage from '../../lib/pages/gutenboarding/features-page.js';
import GutenbergEditorComponent from '../../lib/gutenberg/gutenberg-editor-component';
import LanguagePickerComponent from '../../lib/components/gutenboarding-language-picker';

import * as driverManager from '../../lib/driver-manager.js';
import * as dataHelper from '../../lib/data-helper.js';
import * as driverHelper from '../../lib/driver-helper.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

describe( `Gutenboarding - Create new site as existing user: (${ screenSize }) @parallel @canary`, function () {
	this.timeout( mochaTimeOut );
	const siteTitle = dataHelper.randomPhrase();
	const domainQuery = dataHelper.randomPhrase();
	let newSiteDomain = '';

	it( 'Can log in as user', async function () {
		await new LoginFlow( this.driver ).login();
	} );

	it( 'Can visit Gutenboarding page and see Onboarding block', async function () {
		const newPage = await NewPage.Visit( this.driver, NewPage.getGutenboardingURL() );
		const isDisplayed = await newPage.isOnboardingBlockDisplayed();
		assert( isDisplayed, 'Onboarding block is not displayed' );
	} );

	it( 'Can see Acquire Intent and set site title', async function () {
		const acquireIntentPage = await AcquireIntentPage.Expect( this.driver );
		await acquireIntentPage.enterSiteTitle( siteTitle );
	} );

	it( 'Can change language to Spanish and back to English', async function () {
		const acquireIntentPage = await AcquireIntentPage.Expect( this.driver );
		const languagePicker = await LanguagePickerComponent.Expect( this.driver );

		await languagePicker.switchLanguage( 'es' );

		const nextButtonLocatorES = driverHelper.createTextLocator(
			acquireIntentPage.nextButtonLocator,
			'Continuar'
		);
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, nextButtonLocatorES );

		await languagePicker.switchLanguage( 'en' );

		const nextButtonLocatorEN = driverHelper.createTextLocator(
			acquireIntentPage.nextButtonLocator,
			'Continue'
		);
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, nextButtonLocatorEN );

		await acquireIntentPage.goToNextStep();
	} );

	it( 'Can see Domains Page, search for domains, pick a free domain, and continue', async function () {
		const domainsPage = await DomainsPage.Expect( this.driver );
		await domainsPage.enterDomainQuery( domainQuery );
		await domainsPage.waitForDomainSuggestionsToLoad();
		newSiteDomain = await domainsPage.getFreeDomainName();
		await domainsPage.selectFreeDomain();
		await domainsPage.continueToNextStep();
	} );

	it( 'Can see Design Locator and select a random free design', async function () {
		const designLocatorPage = await DesignLocatorPage.Expect( this.driver );
		await designLocatorPage.selectFreeDesign();
	} );

	it( 'Can see Style Preview, choose a random font pairing, and continue', async function () {
		const stylePreviewPage = await StylePreviewPage.Expect( this.driver );
		await stylePreviewPage.selectFontPairing();
		await stylePreviewPage.continue();
	} );

	it( 'Can see Feature picker and choose a feature that requires a business plan', async function () {
		const featuresPage = await FeaturesPage.Expect( this.driver );
		await featuresPage.selectPluginsFeature();
		await featuresPage.goToNextStep();
	} );

	it( 'Can see Plans Grid with business plan recommended and can choose free plan', async function () {
		const plansPage = await PlansPage.Expect( this.driver );
		const recommendedPlan = await plansPage.getRecommendedPlan( this.driver );
		assert.strictEqual(
			recommendedPlan,
			'Business',
			'The Business plan should be recommended because the plugins feature was selected in the previous step'
		);
		await plansPage.expandAllPlans();
		await plansPage.selectFreePlan();

		// Redirect console messages that starts with "onboarding-debug" to E2E log.
		await this.driver
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
		const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
		await gEditorComponent.initEditor();
	} );

	after( 'Can delete site', async function () {
		await new DeleteSiteFlow( this.driver ).deleteSite( newSiteDomain );
	} );
} );
