import {
	BrowserManager,
	CartCheckoutPage,
	DataHelper,
	RestAPIClient,
	SecretsManager,
	TestAccount,
} from '@automattic/calypso-e2e';
import uploadScreenshotsToBlog from '../../lib/martech-tos-helper';
import { expect, tags, test } from '../../lib/pw-base';

const EXTENDED_TIMEOUT = 20 * 1000;

test.describe(
	DataHelper.createSuiteTitle( 'ToS acceptance tracking screenshots' ),
	{ tag: [ tags.LEGAL, tags.DESKTOP_ONLY ] },
	() => {
		test.describe.configure( { timeout: 900_000 } );

		test( 'Screenshot checkout page in en and Mag-16 locales', async ( { page } ) => {
			const restAPIClient = new RestAPIClient( SecretsManager.secrets.testAccounts.martechTosUser );
			const blogID = SecretsManager.secrets.testAccounts.martechTosUser.testSites?.primary
				.id as number;

			try {
				await test.step( 'Set up authenticated GBP checkout session', async () => {
					await BrowserManager.setStoreCookie( page, { currency: 'GBP' } );

					const testAccount = new TestAccount( 'martechTosUser' );
					await testAccount.authenticate( page );

					await restAPIClient.setMySettings( { language: 'en' } );
					await page.reload( { waitUntil: 'domcontentloaded', timeout: EXTENDED_TIMEOUT } );
					await page.waitForURL( /home/ );
				} );

				const cartCheckoutPage = new CartCheckoutPage( page );

				await test.step( 'Add WordPress.com Business plan to cart', async () => {
					await Promise.all( [
						page.waitForURL( /.*checkout.*/ ),
						page.goto( DataHelper.getCalypsoURL( '/checkout/business' ) ),
					] );
				} );

				for ( const locale of DataHelper.getMag16Locales() ) {
					await test.step( `Screenshot checkout page for ${ locale }`, async () => {
						await restAPIClient.setMySettings( { language: locale } );
						await page.reload( { waitUntil: 'domcontentloaded', timeout: EXTENDED_TIMEOUT } );

						await page.setViewportSize( { width: 1280, height: 720 } );
						await cartCheckoutPage.validatePaymentForm();
						await page.screenshot( {
							path: `tos_checkout_desktop_${ locale }.png`,
							fullPage: true,
							type: 'jpeg',
							quality: 20,
						} );
						await page.setViewportSize( { width: 410, height: 1620 } );
						await page.screenshot( {
							path: `tos_checkout_mobile_${ locale }.png`,
							fullPage: true,
							type: 'jpeg',
							quality: 20,
						} );
						await page.setViewportSize( { width: 1024, height: 1366 } );
						await page.screenshot( {
							path: `tos_checkout_tablet_${ locale }.png`,
							fullPage: true,
							type: 'jpeg',
							quality: 20,
						} );
					} );
				}

				await test.step( 'Zip screenshots and upload', async () => {
					const filenameTitle = 'tos-screenshots-checkout';
					const result = await uploadScreenshotsToBlog(
						`${ filenameTitle }.zip`,
						'tos_checkout_*'
					);

					expect( result?.media?.[ 0 ]?.title ).toStrictEqual( filenameTitle );
					expect( result?.media?.[ 0 ]?.mime_type ).toStrictEqual( 'application/zip' );
				} );
			} finally {
				const response = await restAPIClient.clearShoppingCart( blogID );
				// eslint-disable-next-line playwright/no-conditional-in-test -- teardown logging, not test logic
				if ( response.success !== true ) {
					console.error( `Failed to clear the shopping cart for blogID ${ blogID }` );
				}
			}
		} );
	}
);
