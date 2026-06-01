import { DataHelper } from '@automattic/calypso-e2e';
import uploadScreenshotsToBlog from '../../lib/martech-tos-helper';
import { expect, tags, test } from '../../lib/pw-base';

const magnificientNonEnLocales = [
	'pt-br',
	'fr',
	'es',
	'de',
	'he',
	'ja',
	'it',
	'nl',
	'ru',
	'tr',
	'id',
	'zh-cn',
	'zh-tw',
	'ko',
	'ar',
	'sv',
];

test.describe( 'ToS acceptance tracking screenshots', { tag: [ tags.LEGAL ] }, () => {
	test( 'Screenshot white background signup page in en and Mag-16 locales and upload', async ( {
		page,
	} ) => {
		test.setTimeout( 1800000 );

		await test.step( 'Screenshot signup page for all locales', async () => {
			for ( const locale of [ ...magnificientNonEnLocales, 'en' ] ) {
				page.setViewportSize( { width: 1280, height: 720 } );
				await page.goto( DataHelper.getCalypsoURL( `start/${ locale }` ), {
					waitUntil: 'domcontentloaded',
				} );
				await page.waitForSelector( 'body.is-section-stepper' );
				await page.screenshot( {
					path: `tos_white_signup_desktop_${ locale }.png`,
					fullPage: true,
					type: 'jpeg',
					quality: 20,
				} );
				page.setViewportSize( { width: 410, height: 820 } );
				await page.screenshot( {
					path: `tos_white_signup_mobile_${ locale }.png`,
					fullPage: true,
					type: 'jpeg',
					quality: 20,
				} );
				page.setViewportSize( { width: 1024, height: 1366 } );
				await page.screenshot( {
					path: `tos_white_signup_tablet_${ locale }.png`,
					fullPage: true,
					type: 'jpeg',
					quality: 20,
				} );
			}
		} );

		await test.step( 'Zip screenshots and upload', async () => {
			const filetnameTitle = 'tos-screenshots-signup';
			const zipFilename = `${ filetnameTitle }.zip`;
			const result = await uploadScreenshotsToBlog( zipFilename, 'tos_white_signup_*' );

			expect( result?.media?.[ 0 ]?.title ).toStrictEqual( filetnameTitle );
			expect( result?.media?.[ 0 ]?.mime_type ).toStrictEqual( 'application/zip' );
		} );
	} );
} );
