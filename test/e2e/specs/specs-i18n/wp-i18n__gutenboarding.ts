/**
 * @group i18n
 */

import {
	setupHooks,
	validatePageTranslations,
	DataHelper,
	GutenboardingFlow,
	TestEnvironment,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( 'I18N: Gutenboarding', function () {
	let page: Page;
	let gutenboardingFlow: GutenboardingFlow;

	setupHooks( ( args: { page: Page } ) => {
		page = args.page;
	} );

	describe.each( TestEnvironment.LOCALES() )( 'Locale: %s', function ( locale ) {
		it( 'Navigate to /new', async function () {
			await page.goto( DataHelper.getCalypsoURL( 'new' ) );
			gutenboardingFlow = new GutenboardingFlow( page );
		} );

		it( `Change the locale (${ locale })`, async function () {
			await gutenboardingFlow.switchLanguage( locale );
		} );

		it( `Display translations on aquire intent page (${ locale })`, async function () {
			await validatePageTranslations( page, locale );
			await gutenboardingFlow.clickSkipButton();
		} );

		it( `Display translations on design selector page (${ locale })`, async function () {
			await validatePageTranslations( page, locale );
			await gutenboardingFlow.selectDesign( 'Stratford' );
		} );

		it( `Display translations on style preview page (${ locale })`, async function () {
			await gutenboardingFlow.selectFont( 'Raleway' );
			await validatePageTranslations( page, locale );
			await gutenboardingFlow.clickNextButton();
		} );

		it( `Display translations on domains page (${ locale })`, async function () {
			await gutenboardingFlow.searchDomain( DataHelper.getRandomPhrase() );
			await gutenboardingFlow.selectDomain( '.wordpress.com' );
			await validatePageTranslations( page, locale );
			await gutenboardingFlow.clickNextButton();
		} );

		it( `Display translations on features page (${ locale })`, async function () {
			await gutenboardingFlow.selectFeatures( [] );
			await validatePageTranslations( page, locale );
			await gutenboardingFlow.clickSkipButton();
		} );

		it( `Display translations on plans page (${ locale })`, async function () {
			await gutenboardingFlow.expandAllPlans();
			await validatePageTranslations( page, locale );
		} );
	} );
} );
