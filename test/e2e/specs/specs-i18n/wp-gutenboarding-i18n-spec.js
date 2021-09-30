import config from 'config';
import LanguagePickerComponent from '../../lib/components/gutenboarding-language-picker';
import * as dataHelper from '../../lib/data-helper.js';
import * as driverHelper from '../../lib/driver-helper.js';
import * as driverManager from '../../lib/driver-manager.js';
import AcquireIntentPage from '../../lib/pages/gutenboarding/acquire-intent-page.js';
import DesignsPage from '../../lib/pages/gutenboarding/designs-page.js';
import DomainsPage from '../../lib/pages/gutenboarding/domains-page.js';
import FeaturesPage from '../../lib/pages/gutenboarding/features-page.js';
import NewPage from '../../lib/pages/gutenboarding/new-page.js';
import PlansPage from '../../lib/pages/gutenboarding/plans-page.js';
import StylePreviewPage from '../../lib/pages/gutenboarding/style-preview-page.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );

const locale = driverManager.currentLocale();

describe( `Gutenboarding translations @i18n (${ locale })`, function () {
	this.timeout( mochaTimeOut );

	it( `should change the locale (${ locale })`, async function () {
		await NewPage.Visit( this.driver, NewPage.getGutenboardingURL() );
		const languagePicker = await LanguagePickerComponent.Expect( this.driver );
		await languagePicker.switchLanguage( locale );
	} );

	it( `should display translations on aquire intent page (${ locale })`, async function () {
		const acquireIntentPage = await AcquireIntentPage.Expect( this.driver );
		await driverHelper.verifyTranslationsPresent( this.driver, locale );
		await acquireIntentPage.skipStep();
	} );

	it( `should display translations on design selector page (${ locale })`, async function () {
		const designsPage = await DesignsPage.Expect( this.driver );
		await driverHelper.verifyTranslationsPresent( this.driver, locale );
		await designsPage.selectFreeDesign();
	} );

	it( `should display translations on style preview page (${ locale })`, async function () {
		const stylePreviewPage = await StylePreviewPage.Expect( this.driver );
		await stylePreviewPage.selectFontPairing();
		await driverHelper.verifyTranslationsPresent( this.driver, locale );
		await stylePreviewPage.continue();
	} );

	it( `should display translations on domains page (${ locale })`, async function () {
		const domainsPage = await DomainsPage.Expect( this.driver );
		await domainsPage.enterDomainQuery( dataHelper.randomPhrase() );
		await domainsPage.selectFreeDomain();
		await driverHelper.verifyTranslationsPresent( this.driver, locale );
		await domainsPage.continueToNextStep();
	} );

	it( `should display translations on features page (${ locale })`, async function () {
		const featuresPage = await FeaturesPage.Expect( this.driver );
		await featuresPage.selectPluginsFeature();
		await driverHelper.verifyTranslationsPresent( this.driver, locale );
		await featuresPage.goToNextStep();
	} );

	it( `should display translations on plans page (${ locale })`, async function () {
		const plansPage = await PlansPage.Expect( this.driver );
		await plansPage.expandAllPlans();
		await driverHelper.verifyTranslationsPresent( this.driver, locale );
	} );
} );
