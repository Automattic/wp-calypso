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
	{ tag: [ tags.LEGAL ] },
	() => {
		test( 'Screenshot checkout page for all Mag-16 locales and upload', async ( { page } ) => {
			test.setTimeout( 1800000 );

			let restAPIClient: RestAPIClient;

			await test.step( 'Setup: authenticate and set store cookie', async () => {
				await BrowserManager.setStoreCookie( page, { currency: 'GBP' } );

				const testAccount = new TestAccount( 'martechTosUser' );
				await testAccount.authenticate( page );

				restAPIClient = new RestAPIClient( SecretsManager.secrets.testAccounts.martechTosUser );

				await restAPIClient.setMySettings( { language: 'en' } );
				await page.reload( { waitUntil: 'domcontentloaded', timeout: EXTENDED_TIMEOUT } );
			} );

			await test.step( 'See Home', async () => {
				await page.waitForURL( /home/ );
			} );

			await test.step( 'Add WordPress.com Business plan to cart', async () => {
				await Promise.all( [
					page.waitForURL( /.*checkout.*/ ),
					page.goto( DataHelper.getCalypsoURL( '/checkout/business' ) ),
				] );
			} );

			const cartCheckoutPage = new CartCheckoutPage( page );

			for ( const locale of DataHelper.getMag16Locales() ) {
				await test.step( `Screenshot checkout page for ${ locale }`, async () => {
					await restAPIClient.setMySettings( { language: locale } );
					await page.reload( { waitUntil: 'domcontentloaded', timeout: EXTENDED_TIMEOUT } );

					await cartCheckoutPage.validatePaymentForm();

					page.setViewportSize( { width: 1280, height: 720 } );
					await page.screenshot( {
						path: `tos_checkout_desktop_${ locale }.png`,
						fullPage: true,
						type: 'jpeg',
						quality: 20,
					} );
					page.setViewportSize( { width: 410, height: 1620 } );
					await page.screenshot( {
						path: `tos_checkout_mobile_${ locale }.png`,
						fullPage: true,
						type: 'jpeg',
						quality: 20,
					} );
					page.setViewportSize( { width: 1024, height: 1366 } );
					await page.screenshot( {
						path: `tos_checkout_tablet_${ locale }.png`,
						fullPage: true,
						type: 'jpeg',
						quality: 20,
					} );
				} );
			}

			await test.step( 'Zip screenshots and upload', async () => {
				const filetnameTitle = 'tos-screenshots-checkout';
				const zipFilename = `${ filetnameTitle }.zip`;
				const result = await uploadScreenshotsToBlog( zipFilename, 'tos_checkout_*' );

				expect( result?.media?.[ 0 ]?.title ).toStrictEqual( filetnameTitle );
				expect( result?.media?.[ 0 ]?.mime_type ).toStrictEqual( 'application/zip' );
			} );

			await test.step( 'Cleanup: clear shopping cart', async () => {
				const blogID = SecretsManager.secrets.testAccounts.martechTosUser.testSites?.primary
					.id as number;
				const response = await restAPIClient.clearShoppingCart( blogID );
				if ( response.success !== true ) {
					console.error( `Failed to clear the shopping cart for blogID ${ blogID }` );
				}
			} );
		} );
	}
);
