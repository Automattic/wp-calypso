/**
 * @group calypso-pr
 * @group gutenberg
 */

import { DataHelper, GutenboardingFlow } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Gutenboarding: Language' ), function () {
	let gutenboardingFlow: GutenboardingFlow;
	let page: Page;

	beforeAll( async () => {
		page = await browser.newPage();
	} );

	it( 'Navigate to /new', async function () {
		await page.goto( DataHelper.getCalypsoURL( 'new' ) );
		gutenboardingFlow = new GutenboardingFlow( page );
	} );

	describe.each( [
		{ language: 'Spanish', target: 'es', labelText: 'Mi página web se llama' },
		{ language: 'Japanese', target: 'ja', labelText: '私のサイトの名前は' },
		// { language: 'Arabic', target: 'ar', labelText: 'سيكون اسم موقعي' }, // https://github.com/Automattic/wp-calypso/issues/56006
		{ language: 'Hebrew', target: 'he', labelText: 'האתר שלי נקרא' },
		{ language: 'Russian', target: 'ru', labelText: 'Мой сайт называется' },
	] )( 'Change Language', function ( { language, target, labelText } ) {
		it( `Change language to ${ language }`, async function () {
			await gutenboardingFlow.switchLanguage( target );
		} );

		it( `Acquire intent is displayed in ${ language }`, async function () {
			const text = await gutenboardingFlow.getSiteTitleLabel();
			expect( text ).toBe( labelText );
		} );
	} );
} );
