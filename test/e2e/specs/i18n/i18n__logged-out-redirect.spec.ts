/**
 * End-to-end tests for verifying internationalization (i18n) redirects for unauthenticated visitors.
 *
 * This test suite iterates over a list of supported locales and performs the following checks for each locale:
 *
 * 1. **Homepage Redirect**: Ensures that visiting the homepage as an unauthenticated user with a specific browser locale
 *    results in a redirect to the correct localized homepage URL.
 *
 * 2. **Plans to Pricing Page Redirect**: Ensures that visiting the plans page in a specific locale redirects
 *    to the correct localized pricing page URL.
 *
 * @file
 * - Uses Playwright's test runner and custom helper utilities.
 * - Tests are tagged with `@i18n` for filtering.
 * - The default locale ('en') does not use a locale path prefix.
 *
 * @see ../../lib/pw_base
 * @see ../../lib/types_shared
 */
import { test, expect } from '../../lib/pw_base';
import { locale } from '../../lib/types_shared';

const localesToTest: Array< locale > = [
	'ar',
	'de',
	'en',
	'es',
	'fr',
	'he',
	'id',
	'it',
	'ja',
	'ko',
	'nl',
	'pt-br',
	'ru',
	'sv',
	'tr',
	'zh-cn',
	'zh-tw',
];

for ( const locale of localesToTest ) {
	test.describe( `I18N: Homepage Redirect ${ locale }`, { tag: '@i18n' }, () => {
		test.use( { locale: locale } );
		test( `As an unauthenticated visitor using '${ locale }' as my locale, I can visit the homepage and see the correct URL`, async ( {
			page,
			helperData,
		} ) => {
			const homePageURL = helperData.getCalypsoURL();
			const localisedHomePageURL = helperData.getCalypsoURL( helperData.getLocalePath( locale ) );

			await test.step( 'When I visit the homepage', async () => {
				await page.goto( homePageURL );
			} );

			await test.step( 'Then I am redirected to the correct locale URL', async () => {
				await page.waitForURL( localisedHomePageURL );
				expect( page.url() ).toBe( localisedHomePageURL );
			} );
		} );
	} );

	test.describe( `I18N: Plans -> Pricing Page Redirect ${ locale }`, { tag: '@i18n' }, () => {
		test.use( { locale: locale } );
		test( `As an unauthenticated visitor using '${ locale }' as my locale, I can visit the plans page and see the correct URL for the pricing page`, async ( {
			page,
			helperData,
		} ) => {
			const plansPageURL = helperData.getCalypsoURL(
				`${ helperData.getLocalePath( locale ) }plans/`
			);
			const pricingPageURL = helperData.getCalypsoURL(
				`${ helperData.getLocalePath( locale ) }pricing/`
			);

			await test.step( 'When I visit the plans page in my locale', async () => {
				await page.goto( plansPageURL );
			} );

			await test.step( 'Then I am redirected to the pricing page in my locale', async () => {
				await page.waitForURL( pricingPageURL );
				expect( page.url() ).toBe( pricingPageURL );
			} );
		} );
	} );
}
