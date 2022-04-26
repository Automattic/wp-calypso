/**
 * @group legal
 */
import fs from 'fs';
import {
	ChangeUILanguageFlow,
	DataHelper,
	LoginPage,
	NavbarComponent,
	PlansPage,
	CartCheckoutPage,
	SidebarComponent,
	BrowserManager,
} from '@automattic/calypso-e2e';
import archiver from 'archiver';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { Page, Browser } from 'playwright';
import type { LanguageSlug } from '@automattic/languages';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'ToS acceptance tracking screenshots' ), function () {
	const blogName = 'e2eflowtestingtos1.wordpress.com';
	const cartItemForBusinessPlan = 'WordPress.com Business';
	let page: Page;
	let plansPage: PlansPage;

	beforeAll( async () => {
		page = await browser.newPage();
	} );

	describe( 'ToS screenshots of WP.com checkout in desktop, tablet, and mobile viewports', function () {
		jest.setTimeout( 1800000 );
		let cartCheckoutPage: CartCheckoutPage;
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

		it( 'Login to marTech user account', async function () {
			const loginPage = new LoginPage( page );
			await loginPage.visit( { path: 'new' } );
			const credentials = DataHelper.getAccountCredential( 'martechTosUser' );
			await loginPage.logInWithCredentials( ...credentials );
		} );

		it( 'Set store cookie', async function () {
			await BrowserManager.setStoreCookie( page, { currency: 'GBP' } );
		} );

		it( 'Set interface language to en', async function () {
			await page.goto( DataHelper.getCalypsoURL( 'home' ), { waitUntil: 'networkidle' } );
			const changeUILanguageFlow = new ChangeUILanguageFlow( page );
			await changeUILanguageFlow.changeUILanguage( 'en' as LanguageSlug );
			await page.goto( DataHelper.getCalypsoURL( 'home' ), { waitUntil: 'networkidle' } );
		} );

		it( 'Navigate to Upgrades > Plans', async function () {
			const navbarCompnent = new NavbarComponent( page );
			await navbarCompnent.clickMySites();
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Upgrades', 'Plans' );
		} );

		it( 'Click on the "Plans" navigation tab', async function () {
			plansPage = new PlansPage( page, 'legacy' );
			await plansPage.clickTab( 'Plans' );
		} );

		it( 'Click on "Upgrade" button for WordPress.com Business plan', async function () {
			await plansPage.clickPlanActionButton( { plan: 'Business', buttonText: 'Upgrade' } );
		} );

		it( 'WordPress.com Business is added to cart', async function () {
			cartCheckoutPage = new CartCheckoutPage( page );
			await cartCheckoutPage.validateCartItem( cartItemForBusinessPlan );
		} );

		it( 'Screenshot checkout page for all en and non-en locales', async function () {
			const changeUILanguageFlow = new ChangeUILanguageFlow( page );
			for ( const locale of [ ...magnificientNonEnLocales, 'en' ] ) {
				page.setViewportSize( { width: 1280, height: 720 } );
				await page.goto( DataHelper.getCalypsoURL( 'home' ), { waitUntil: 'networkidle' } );
				await changeUILanguageFlow.changeUILanguage( locale as LanguageSlug );
				await cartCheckoutPage.visit( blogName );
				const paymentDetails = DataHelper.getTestPaymentDetails();
				await cartCheckoutPage.enterBillingDetails( paymentDetails );
				await cartCheckoutPage.validatePaymentForm();
				await page.screenshot( {
					path: `tos_checkout_desktop_${ locale }.png`,
					fullPage: true,
					type: 'jpeg',
					quality: 20,
				} );
				page.setViewportSize( { width: 410, height: 820 } );
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
			}
		} );

		it( 'Zip screenshots and upload', async function () {
			const zipFilename = 'tos-screenshots-checkout.zip';
			const archive = archiver( 'zip', {
				zlib: { level: 9 }, // Sets the compression level.
			} );
			const output = fs.createWriteStream( zipFilename );
			archive.pipe( output );
			archive.glob( 'tos_checkout_*' );
			archive.finalize();

			output.on( 'close', function () {
				const form = new FormData();
				const bearerToken = DataHelper.getTosUploadToken();
				form.append( 'zip_file', fs.createReadStream( zipFilename ) );
				fetch( 'https://public-api.wordpress.com/wpcom/v2/tos-screenshots', {
					method: 'POST',
					body: form,
					headers: {
						Authorization: `Bearer ${ bearerToken }`,
					},
				} )
					.then( ( response ) => response.json() )
					.then( ( response ) =>
						expect( response?.data?.upload_status ).toStrictEqual( 'success' )
					);
			} );
		} );
	} );
} );
