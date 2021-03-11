/**
 * External Dependencies
 */
import config from 'config';

/**
 * Internal Dependencies
 */
import * as driverManager from '../lib/driver-manager.js';

import NewPage from '../lib/pages/gutenboarding/new-page.js';
import AcquireIntentPage from '../lib/pages/gutenboarding/acquire-intent-page.js';
import LanguagePickerComponent from '../lib/components/gutenboarding-language-picker';
import DesignSelectorPage from '../lib/pages/gutenboarding/design-selector-page.js';
import StylePreviewPage from '../lib/pages/gutenboarding/style-preview-page.js';
import PlansPage from '../lib/pages/gutenboarding/plans-page.js';
import DomainsPage from '../lib/pages/gutenboarding/domains-page.js';
import FeaturesPage from '../lib/pages/gutenboarding/features-page.js';

import * as dataHelper from '../lib/data-helper.js';
import * as driverHelper from '../lib/driver-helper.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

// call run.sh with -I to feed in the mag16
const locale = driverManager.currentLocale();

describe( `Gutenboarding translations @i18n (${ locale })`, function () {
	this.timeout( mochaTimeOut );
	let driver;

	before( async function () {
		this.timeout( startBrowserTimeoutMS );
		driver = await driverManager.startBrowser();
	} );

	step( `should change the locale (${ locale })`, async function () {
		await NewPage.Visit( driver, NewPage.getGutenboardingURL() );
		const languagePicker = await LanguagePickerComponent.Expect( driver );
		await languagePicker.switchLanguage( locale );
	} );

	step( `should display translations on aquire intent page (${ locale })`, async function () {
		const acquireIntentPage = await AcquireIntentPage.Expect( driver );
		await driverHelper.verifyTranslationsPresent( driver, locale );
		await acquireIntentPage.skipStep();
	} );

	step( `should display translations on design selector page (${ locale })`, async function () {
		const designSelectorPage = await DesignSelectorPage.Expect( driver );
		await driverHelper.verifyTranslationsPresent( driver, locale );
		await designSelectorPage.selectFreeDesign();
	} );

	step( `should display translations on style preview page (${ locale })`, async function () {
		const stylePreviewPage = await StylePreviewPage.Expect( driver );
		await stylePreviewPage.selectFontPairing();
		await driverHelper.verifyTranslationsPresent( driver, locale );
		await stylePreviewPage.continue();
	} );

	step( `should display translations on domains page (${ locale })`, async function () {
		const domainsPage = await DomainsPage.Expect( driver );
		await domainsPage.enterDomainQuery( dataHelper.randomPhrase() );
		await domainsPage.selectFreeDomain();
		await driverHelper.verifyTranslationsPresent( driver, locale );
		await domainsPage.continueToNextStep();
	} );

	step( `should display translations on features page (${ locale })`, async function () {
		const featuresPage = await FeaturesPage.Expect( driver );
		await featuresPage.selectPluginsFeature();
		await driverHelper.verifyTranslationsPresent( driver, locale );
		await featuresPage.goToNextStep();
	} );

	step( `should display translations on plans page (${ locale })`, async function () {
		const plansPage = await PlansPage.Expect( driver );
		await plansPage.expandAllPlans();
		await driverHelper.verifyTranslationsPresent( driver, locale );
	} );
} );
