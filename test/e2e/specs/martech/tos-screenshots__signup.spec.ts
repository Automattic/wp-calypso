import { DataHelper } from '@automattic/calypso-e2e';
import uploadScreenshotsToBlog from '../../lib/martech-tos-helper';
import { expect, tags, test } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'ToS acceptance tracking screenshots' ),
	{ tag: [ tags.LEGAL, tags.DESKTOP_ONLY ] },
	() => {
		test.describe.configure( { timeout: 900_000 } );

		test( 'Screenshot white background signup page in en and Mag-16 locales', async ( {
			page,
		} ) => {
			await test.step( 'Capture signup screenshots', async () => {
				for ( const locale of DataHelper.getMag16Locales() ) {
					await page.setViewportSize( { width: 1280, height: 720 } );
					await page.goto( DataHelper.getCalypsoURL( `start/${ locale }` ), {
						waitUntil: 'domcontentloaded',
					} );
					await page.locator( 'body.is-section-stepper' ).waitFor();
					await page.screenshot( {
						path: `tos_white_signup_desktop_${ locale }.png`,
						fullPage: true,
						type: 'jpeg',
						quality: 20,
					} );
					await page.setViewportSize( { width: 410, height: 820 } );
					await page.screenshot( {
						path: `tos_white_signup_mobile_${ locale }.png`,
						fullPage: true,
						type: 'jpeg',
						quality: 20,
					} );
					await page.setViewportSize( { width: 1024, height: 1366 } );
					await page.screenshot( {
						path: `tos_white_signup_tablet_${ locale }.png`,
						fullPage: true,
						type: 'jpeg',
						quality: 20,
					} );
				}
			} );

			await test.step( 'Zip screenshots and upload', async () => {
				const filenameTitle = 'tos-screenshots-signup';
				const result = await uploadScreenshotsToBlog(
					`${ filenameTitle }.zip`,
					'tos_white_signup_*'
				);

				expect( result?.media?.[ 0 ]?.title ).toStrictEqual( filenameTitle );
				expect( result?.media?.[ 0 ]?.mime_type ).toStrictEqual( 'application/zip' );
			} );
		} );
	}
);
