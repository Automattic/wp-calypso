import { DataHelper } from '@automattic/calypso-e2e';
import uploadScreenshotsToBlog from '../../lib/martech-tos-helper';
import { expect, tags, test } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'ToS acceptance tracking screenshots' ),
	{ tag: [ tags.LEGAL, tags.DESKTOP_ONLY ] },
	() => {
		test.describe.configure( { timeout: 900_000 } );

		test( 'Screenshot white background login page in en and Mag-16 locales', async ( {
			page,
			pageLogin,
		} ) => {
			await test.step( 'Capture login screenshots', async () => {
				for ( const locale of DataHelper.getMag16Locales() ) {
					await page.setViewportSize( { width: 1280, height: 720 } );
					await pageLogin.visit( { path: locale } );
					await page.locator( 'body.is-section-login' ).waitFor();
					await page.screenshot( {
						path: `tos_white_login_desktop_${ locale }.png`,
						fullPage: true,
						type: 'jpeg',
						quality: 20,
					} );
					await page.setViewportSize( { width: 410, height: 820 } );
					await page.screenshot( {
						path: `tos_white_login_mobile_${ locale }.png`,
						fullPage: true,
						type: 'jpeg',
						quality: 20,
					} );
					await page.setViewportSize( { width: 1024, height: 1366 } );
					await page.screenshot( {
						path: `tos_white_login_tablet_${ locale }.png`,
						fullPage: true,
						type: 'jpeg',
						quality: 20,
					} );
				}

				const { username, password } = DataHelper.getAccountCredential( 'martechTosUser' );
				await pageLogin.logInWithCredentials( username, password );
			} );

			await test.step( 'Zip screenshots and upload', async () => {
				const filenameTitle = 'tos-screenshots-login-white';
				const result = await uploadScreenshotsToBlog(
					`${ filenameTitle }.zip`,
					'tos_white_login_*'
				);

				expect( result?.media?.[ 0 ]?.title ).toStrictEqual( filenameTitle );
				expect( result?.media?.[ 0 ]?.mime_type ).toStrictEqual( 'application/zip' );
			} );
		} );
	}
);
