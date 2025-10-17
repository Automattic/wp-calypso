import { expect, tags, test } from '../../lib/pw-base';
import { locale } from '../../lib/types-shared';

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
	test.describe(
		`I18N: Homepage Redirect ${ locale }`,
		{ tag: [ tags.I18N, tags.DESKTOP_ONLY ] },
		() => {
			test.use( { locale: locale } );
			test( `As an unauthenticated visitor using '${ locale }' as my locale, I can visit the homepage and see the correct URL`, async ( {
				page,
				environment,
				helperData,
			} ) => {
				const homePageURL = environment.WPCOM_BASE_URL;
				const localisedHomePageURL = `${ homePageURL }/${ helperData.getLocalePath( locale ) }`;

				await test.step( 'When I visit the homepage', async () => {
					await page.goto( homePageURL );
				} );

				await test.step( 'Then I am redirected to the correct locale URL', async () => {
					await page.waitForURL( localisedHomePageURL );
					expect( page.url() ).toBe( localisedHomePageURL );
				} );
			} );
		}
	);

	test.describe(
		`I18N: Plans -> Pricing Page Redirect ${ locale }`,
		{ tag: [ tags.I18N, tags.DESKTOP_ONLY ] },
		() => {
			test.use( { locale: locale } );
			test( `As an unauthenticated visitor using '${ locale }' as my locale, I can visit the plans page and see the correct URL for the pricing page`, async ( {
				page,
				environment,
				helperData,
			} ) => {
				const homePageURL = environment.WPCOM_BASE_URL;
				const plansPageURL = `${ homePageURL }/${ helperData.getLocalePath( locale ) }plans/`;
				const pricingPageURL = `${ homePageURL }/${ helperData.getLocalePath( locale ) }pricing/`;

				await test.step( 'When I visit the plans page in my locale', async () => {
					await page.goto( plansPageURL );
				} );

				await test.step( 'Then I am redirected to the pricing page in my locale', async () => {
					await page.waitForURL( pricingPageURL );
					expect( page.url() ).toBe( pricingPageURL );
				} );
			} );
		}
	);
}
