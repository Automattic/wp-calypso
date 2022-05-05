/**
 * @group legal
 */
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
import { Page, Browser } from 'playwright';
import uploadScreenshotsToBlog from '../../lib/martech-tos-helper';
import type { LanguageSlug } from '@automattic/languages';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'ToS acceptance tracking screenshots' ), function () {
	const blogName = 'e2eflowtestingtos1.wordpress.com';
	const cartItemForProPlan = 'WordPress.com Pro';
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
			await page.reload( { waitUntil: 'networkidle' } );
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

		it( 'Click on "Upgrade" button for WordPress.com Pro plan', async function () {
			await plansPage.selectPlan( 'Pro' );
		} );

		it( 'WordPress.com Pro is added to cart', async function () {
			cartCheckoutPage = new CartCheckoutPage( page );
			await cartCheckoutPage.validateCartItem( cartItemForProPlan );
		} );

		it( 'Screenshot checkout page for all en and non-en locales', async function () {
			const changeUILanguageFlow = new ChangeUILanguageFlow( page );
			for ( const locale of [ ...magnificientNonEnLocales, 'en' ] ) {
				page.setViewportSize( { width: 1280, height: 720 } );
				await page.goto( DataHelper.getCalypsoURL( 'home' ), { waitUntil: 'networkidle' } );
				await changeUILanguageFlow.changeUILanguage( locale as LanguageSlug );
				await page.goto( DataHelper.getCalypsoURL( 'home' ), { waitUntil: 'networkidle' } );
				await cartCheckoutPage.visit( blogName );
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
			const filetnameTitle = 'tos-screenshots-checkout';
			const zipFilename = `${ filetnameTitle }.zip`;
			const result = await uploadScreenshotsToBlog( zipFilename, 'tos_checkout_*' );

			expect( result?.media?.[ 0 ]?.title ).toStrictEqual( filetnameTitle );
			expect( result?.media?.[ 0 ]?.mime_type ).toStrictEqual( 'application/zip' );
		} );
	} );
} );
