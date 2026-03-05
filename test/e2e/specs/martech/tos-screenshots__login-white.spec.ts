import { DataHelper, LoginPage } from '@automattic/calypso-e2e';
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

test.describe(
	DataHelper.createSuiteTitle( 'ToS acceptance tracking screenshots' ),
	{ tag: [ tags.LEGAL ] },
	() => {
		test( 'Screenshot white background login page in en and Mag-16 locales and upload', async ( {
			page,
		} ) => {
			test.setTimeout( 1800000 );

			const loginPage = new LoginPage( page );

			await test.step( 'Screenshot login page for all locales', async () => {
				for ( const locale of [ 'en', ...magnificientNonEnLocales ] ) {
					page.setViewportSize( { width: 1280, height: 720 } );
					await loginPage.visit( { path: locale } );
					page.waitForSelector( '.is-section-login' );
					await page.screenshot( {
						path: `tos_white_login_desktop_${ locale }.png`,
						fullPage: true,
						type: 'jpeg',
						quality: 20,
					} );
					page.setViewportSize( { width: 410, height: 820 } );
					await page.screenshot( {
						path: `tos_white_login_mobile_${ locale }.png`,
						fullPage: true,
						type: 'jpeg',
						quality: 20,
					} );
					page.setViewportSize( { width: 1024, height: 1366 } );
					await page.screenshot( {
						path: `tos_white_login_tablet_${ locale }.png`,
						fullPage: true,
						type: 'jpeg',
						quality: 20,
					} );
				}
				const { username, password } = DataHelper.getAccountCredential( 'martechTosUser' );
				await loginPage.logInWithCredentials( username, password );
			} );

			await test.step( 'Zip screenshots and upload', async () => {
				const filetnameTitle = 'tos-screenshots-login-white';
				const zipFilename = `${ filetnameTitle }.zip`;
				const result = await uploadScreenshotsToBlog( zipFilename, 'tos_white_login_*' );

				expect( result?.media?.[ 0 ]?.title ).toStrictEqual( filetnameTitle );
				expect( result?.media?.[ 0 ]?.mime_type ).toStrictEqual( 'application/zip' );
			} );
		} );
	}
);
