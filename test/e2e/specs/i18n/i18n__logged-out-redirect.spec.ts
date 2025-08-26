import { test, expect } from '../../lib/pw_base';

const locales = [
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

locales.forEach( ( locale ) => {
	const localePath = locale === 'en' ? '' : `${ locale }/`;

	test.describe( `I18N: Homepage Redirect ${ locale }`, { tag: '@i18n' }, () => {
		test.use( { locale: locale } );
		test( `As an unauthenticated visitor using '${ locale }' as my locale, I can visit the homepage and see the correct URL`, async ( {
			page,
			helperData,
		} ) => {
			const homePageURL = helperData.getCalypsoURL();
			const localisedHomePageURL = helperData.getCalypsoURL( localePath );

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
			const plansPageURL = helperData.getCalypsoURL( `${ localePath }plans/` );
			const pricingPageURL = helperData.getCalypsoURL( `${ localePath }pricing/` );

			await test.step( 'When I visit the plans page in my locale', async () => {
				await page.goto( plansPageURL );
			} );

			await test.step( 'Then I am redirected to the pricing page in my locale', async () => {
				await page.waitForURL( pricingPageURL );
				expect( page.url() ).toBe( pricingPageURL );
			} );
		} );
	} );
} );
