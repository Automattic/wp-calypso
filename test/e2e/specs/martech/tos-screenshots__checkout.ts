/**
 * @group legal
 */
import {
	DataHelper,
	CartCheckoutPage,
	BrowserManager,
	TestAccount,
	RestAPIClient,
	SecretsManager,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import uploadScreenshotsToBlog from '../../lib/martech-tos-helper';

declare const browser: Browser;
const EXTENDED_TIMEOUT = 20 * 1000;

describe( DataHelper.createSuiteTitle( 'ToS acceptance tracking screenshots' ), function () {
	let page: Page;
	let restAPIClient: RestAPIClient;

	beforeAll( async function () {
		page = await browser.newPage();

		await BrowserManager.setStoreCookie( page, { currency: 'GBP' } );

		const testAccount = new TestAccount( 'martechTosUser' );
		await testAccount.authenticate( page );

		restAPIClient = new RestAPIClient( SecretsManager.secrets.testAccounts.martechTosUser );

		await restAPIClient.setMySettings( { language: 'en' } );
		await page.reload( { waitUntil: 'domcontentloaded', timeout: EXTENDED_TIMEOUT } );
	} );

	it( 'Add WordPress.com Business plan to cart', async function () {
		await Promise.all( [
			page.waitForURL( /.*checkout.*/ ),
			page.goto( DataHelper.getCalypsoURL( `/checkout/business` ) ),
		] );
	} );

	describe.each( DataHelper.getMag16Locales() )(
		'Validate Checkout page as %s',
		function ( locale ) {
			let cartCheckoutPage: CartCheckoutPage;

			beforeAll( async function () {
				cartCheckoutPage = new CartCheckoutPage( page );

				await restAPIClient.setMySettings( { language: locale } );
				await page.reload( { waitUntil: 'domcontentloaded', timeout: EXTENDED_TIMEOUT } );
			} );

			it( `Screenshot checkout page for ${ locale }`, async function () {
				await page.setViewportSize( { width: 1280, height: 720 } );

				await cartCheckoutPage.validatePaymentForm();
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
	);

	it( 'Zip screenshots and upload', async function () {
		const filetnameTitle = 'tos-screenshots-checkout';
		const zipFilename = `${ filetnameTitle }.zip`;
		const result = await uploadScreenshotsToBlog( zipFilename, 'tos_checkout_*' );

		expect( result?.media?.[ 0 ]?.title ).toStrictEqual( filetnameTitle );
		expect( result?.media?.[ 0 ]?.mime_type ).toStrictEqual( 'application/zip' );
	} );

	afterAll( async function () {
		const blogID = SecretsManager.secrets.testAccounts.martechTosUser.testSites?.primary
			.id as number;
		const response = await restAPIClient.clearShoppingCart( blogID );
		if ( response.success !== true ) {
			console.error( `Failed to clear the shopping cart for blogID ${ blogID }` );
		}
	} );
} );
