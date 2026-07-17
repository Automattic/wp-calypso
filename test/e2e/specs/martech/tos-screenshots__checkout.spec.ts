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
import type { Page } from 'playwright';

const EXTENDED_TIMEOUT = 20 * 1000;

test.describe(
	DataHelper.createSuiteTitle( 'ToS acceptance tracking screenshots' ),
	{ tag: [ tags.LEGAL, tags.DESKTOP_ONLY ] },
	() => {
		test.describe.configure( { mode: 'serial' } );

		let cartCheckoutPage: CartCheckoutPage;
		let page: Page;
		let restAPIClient: RestAPIClient;

		test.beforeAll( async ( { browser } ) => {
			page = await browser.newPage();
			await BrowserManager.setStoreCookie( page, { currency: 'GBP' } );

			const testAccount = new TestAccount( 'martechTosUser' );
			await testAccount.authenticate( page );

			restAPIClient = new RestAPIClient( SecretsManager.secrets.testAccounts.martechTosUser );
			await restAPIClient.setMySettings( { language: 'en' } );
			await page.reload( { waitUntil: 'domcontentloaded', timeout: EXTENDED_TIMEOUT } );
			cartCheckoutPage = new CartCheckoutPage( page );
		} );

		test.afterAll( async () => {
			const blogID = SecretsManager.secrets.testAccounts.martechTosUser.testSites?.primary
				.id as number;
			const response = await restAPIClient.clearShoppingCart( blogID );
			if ( response.success !== true ) {
				console.error( `Failed to clear the shopping cart for blogID ${ blogID }` );
			}
			await page.close();
		} );

		test( 'See Home', async () => {
			await page.waitForURL( /home/ );
		} );

		test( 'Add WordPress.com Business plan to cart', async () => {
			await Promise.all( [
				page.waitForURL( /.*checkout.*/ ),
				page.goto( DataHelper.getCalypsoURL( '/checkout/business' ) ),
			] );
		} );

		for ( const locale of DataHelper.getMag16Locales() ) {
			test( `Screenshot checkout page for ${ locale }`, async () => {
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

		test( 'Zip screenshots and upload', async () => {
			const filenameTitle = 'tos-screenshots-checkout';
			const result = await uploadScreenshotsToBlog( `${ filenameTitle }.zip`, 'tos_checkout_*' );

			expect( result?.media?.[ 0 ]?.title ).toStrictEqual( filenameTitle );
			expect( result?.media?.[ 0 ]?.mime_type ).toStrictEqual( 'application/zip' );
		} );
	}
);
