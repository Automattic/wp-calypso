/**
 * @group calypso-release
 */
import fs from 'fs';
import {
	ChangeUILanguageFlow,
	DataHelper,
	DomainSearchComponent,
	LoginPage,
	CartCheckoutPage,
	setupHooks,
	UserSignupPage,
	SignupPickPlanPage,
	CloseAccountFlow,
	BrowserManager,
} from '@automattic/calypso-e2e';
import archiver from 'archiver';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { Page } from 'playwright';
import type { LanguageSlug } from '@automattic/languages';

const selectors = {
	isWhiteLogin: '.is-section-login.is-white-login',
	isBlueLogin: '.is-section-login:not( .is-white-login )',
	isWhiteSignup: '.is-white-signup .is-section-signup',
	isBlueSignup: '.is-section-signup:not( .is-white-signup )',
};

describe( DataHelper.createSuiteTitle( 'Signup: WordPress.com Free' ), function () {
	const inboxId = DataHelper.config.get( 'inviteInboxId' ) as string;
	const username = `e2eflowtestingfree${ DataHelper.getTimestamp() }`;
	const email = DataHelper.getTestEmailAddress( {
		inboxId: inboxId,
		prefix: username,
	} );
	const signupPassword = DataHelper.config.get( 'passwordForNewTestSignUps' ) as string;
	const blogName = DataHelper.getBlogName();

	let page: Page;
	let selectedDomain: string;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( 'Signup', function () {
		jest.setTimeout( 1000000 );
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

		it( 'Screenshot blue login page in desktop viewport, en and Mag-16 locales', async function () {
			const loginPage = new LoginPage( page );
			for ( const locale of [ 'en', ...magnificientNonEnLocales ] ) {
				await loginPage.visitBlueLogin( locale );
				page.waitForSelector( selectors.isBlueLogin );
				await page.screenshot( {
					path: `tos_blue_login_desktop_${ locale }.png`,
					fullPage: true,
					type: 'jpeg',
					quality: 20,
				} );
				page.setViewportSize( { width: 410, height: 820 } );
				await page.screenshot( {
					path: `tos_blue_login_mobile_${ locale }.png`,
					fullPage: true,
					type: 'jpeg',
					quality: 20,
				} );
				page.setViewportSize( { width: 1024, height: 1366 } );
				await page.screenshot( {
					path: `tos_blue_login_tablet_${ locale }.png`,
					fullPage: true,
					type: 'jpeg',
					quality: 20,
				} );
				page.setViewportSize( { width: 1280, height: 720 } );
			}
		} );

		it( 'Screenshot blue signup page in desktop viewport, en and Mag-16 locales', async function () {
			const userSignupPage = new UserSignupPage( page );
			for ( const locale of [ ...magnificientNonEnLocales, 'en' ] ) {
				await userSignupPage.visitBlueSignup( locale );
				page.waitForSelector( selectors.isBlueSignup );
				await page.screenshot( {
					path: `tos_blue_signup_desktop_${ locale }.png`,
					fullPage: true,
					type: 'jpeg',
					quality: 20,
				} );
				page.setViewportSize( { width: 410, height: 820 } );
				await page.screenshot( {
					path: `tos_blue_signup_mobile_${ locale }.png`,
					fullPage: true,
					type: 'jpeg',
					quality: 20,
				} );
				page.setViewportSize( { width: 1024, height: 1366 } );
				await page.screenshot( {
					path: `tos_blue_signup_tablet_${ locale }.png`,
					fullPage: true,
					type: 'jpeg',
					quality: 20,
				} );
				page.setViewportSize( { width: 1280, height: 720 } );
			}
		} );

		it( 'Screenshot white login page in desktop viewport, en and Mag-16 locales', async function () {
			const loginPage = new LoginPage( page );
			for ( const locale of [ 'en', ...magnificientNonEnLocales ] ) {
				await loginPage.visitWhiteLogin( locale );
				page.waitForSelector( selectors.isWhiteLogin );
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
				page.setViewportSize( { width: 1280, height: 720 } );
			}
			await loginPage.signup();
		} );

		it( 'Set store cookie', async function () {
			await BrowserManager.setStoreCookie( page, { currency: 'GBP' } );
		} );

		it( 'Screenshot white signup page in desktop viewport, en and Mag-16 locales', async function () {
			const userSignupPage = new UserSignupPage( page );
			for ( const locale of [ ...magnificientNonEnLocales, 'en' ] ) {
				await userSignupPage.visitWhiteSignup( locale );
				page.waitForSelector( selectors.isWhiteSignup );
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
				page.setViewportSize( { width: 1280, height: 720 } );
			}
			await userSignupPage.signup( email, username, signupPassword );
		} );

		it( 'Select a free .wordpress.com domain', async function () {
			const domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.search( blogName );
			selectedDomain = await domainSearchComponent.selectDomain( '.wordpress.com' );
		} );

		it( 'Select WordPress.com Personal plan', async function () {
			const signupPickPlanPage = new SignupPickPlanPage( page );
			await signupPickPlanPage.selectPlan( 'Personal' );
		} );

		it( 'See secure payment', async function () {
			cartCheckoutPage = new CartCheckoutPage( page );
			await cartCheckoutPage.validateCartItem( 'WordPress.com Personal' );
		} );

		it( 'Enter billing and payment details', async function () {
			const paymentDetails = DataHelper.getTestPaymentDetails();
			await cartCheckoutPage.enterBillingDetails( paymentDetails );
			await cartCheckoutPage.enterCardholderName( paymentDetails );
		} );

		it( 'Screenshot checkout page in desktop, en locale', async function () {
			await page.screenshot( {
				path: 'tos_checkout_desktop_en.png',
				fullPage: true,
				type: 'jpeg',
				quality: 20,
			} );
			page.setViewportSize( { width: 410, height: 820 } );
			await page.screenshot( {
				path: 'tos_checkout_mobile_en.png',
				fullPage: true,
				type: 'jpeg',
				quality: 20,
			} );
			page.setViewportSize( { width: 1024, height: 1366 } );
			await page.screenshot( {
				path: 'tos_checkout_tablet_en.png',
				fullPage: true,
				type: 'jpeg',
				quality: 20,
			} );
			page.setViewportSize( { width: 1280, height: 720 } );
		} );

		it( 'Close checkout and change UI language', async function () {
			const changeUILanguageFlow = new ChangeUILanguageFlow( page );
			for ( const locale of magnificientNonEnLocales ) {
				await cartCheckoutPage.clickCloseCheckout();
				console.log( 'change UI lang to ' + locale );
				await changeUILanguageFlow.changeUILanguage( locale as LanguageSlug );
				cartCheckoutPage.visit( selectedDomain );
				const paymentDetails = DataHelper.getTestPaymentDetails();
				await cartCheckoutPage.enterBillingDetails( paymentDetails );
				await cartCheckoutPage.enterCardholderName( paymentDetails );
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
				page.setViewportSize( { width: 1280, height: 720 } );
			}
		} );

		it( 'Zip screenshots and upload', async function () {
			const archive = archiver( 'zip', {
				zlib: { level: 9 }, // Sets the compression level.
			} );
			const output = fs.createWriteStream( 'test-screenshots-1.zip' );
			archive.pipe( output );
			archive.glob( 'tos_*' );
			archive.finalize();

			output.on( 'close', function () {
				const form = new FormData();
				form.append( 'zip_file', fs.createReadStream( 'test-screenshots-1.zip' ) );
				fetch( 'https://public-api.wordpress.com/wpcom/v2/screenshots', {
					method: 'POST',
					body: form,
				} )
					.then( ( response ) => response.json() )
					.then( ( response ) => expect( response?.upload_status ).toStrictEqual( 'success' ) );
			} );
		} );
	} );

	describe( 'Delete user account', function () {
		it( 'Close account', async function () {
			const closeAccountFlow = new CloseAccountFlow( page );
			await closeAccountFlow.closeAccount();
		} );
	} );
} );
