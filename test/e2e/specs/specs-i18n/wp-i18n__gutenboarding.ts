/**
 * @group i18n
 */

import {
	setupHooks,
	validatePageTranslations,
	DataHelper,
	GutenboardingFlow,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

const locale = DataHelper.getCurrentLocale();

describe( `Gutenboarding translations @i18n (${ locale })`, function () {
	let gutenboardingFlow: GutenboardingFlow;
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it( 'should navigate to /new', async function () {
		await page.goto( DataHelper.getCalypsoURL( 'new' ) );
		gutenboardingFlow = new GutenboardingFlow( page );
	} );

	it( `should change the locale (${ locale })`, async function () {
		await gutenboardingFlow.switchLanguage( locale );
	} );

	it( `should display translations on aquire intent page (${ locale })`, async function () {
		await validatePageTranslations( page, locale );
		await gutenboardingFlow.clickSkipButton();
	} );

	it( `should display translations on design selector page (${ locale })`, async function () {
		await validatePageTranslations( page, locale );
		await gutenboardingFlow.selectDesign( 'Stratford' );
	} );

	it( `should display translations on style preview page (${ locale })`, async function () {
		await gutenboardingFlow.selectFont( 'Raleway' );
		await validatePageTranslations( page, locale );
		await gutenboardingFlow.clickNextButton();
	} );

	it( `should display translations on domains page (${ locale })`, async function () {
		await gutenboardingFlow.searchDomain( DataHelper.getRandomPhrase() );
		await gutenboardingFlow.selectDomain( '.wordpress.com' );
		await validatePageTranslations( page, locale );
		await gutenboardingFlow.clickNextButton();
	} );

	it( `should display translations on features page (${ locale })`, async function () {
		await gutenboardingFlow.selectFeatures( [] );
		await validatePageTranslations( page, locale );
		await gutenboardingFlow.clickSkipButton();
	} );

	it( `should display translations on plans page (${ locale })`, async function () {
		await gutenboardingFlow.expandAllPlans();
		await validatePageTranslations( page, locale );
	} );
} );
