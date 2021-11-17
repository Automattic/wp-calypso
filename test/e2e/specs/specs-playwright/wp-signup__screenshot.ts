/**
 * @group calypso-release
 */
import fs from 'fs';
import {
	DataHelper,
	DomainSearchComponent,
	LoginPage,
	CartCheckoutPage,
	setupHooks,
	UserSignupPage,
	SignupPickPlanPage,
	CloseAccountFlow,
	NavbarComponent,
	BrowserManager,
} from '@automattic/calypso-e2e';
import archiver from 'archiver';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { Page } from 'playwright';

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

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( 'Signup', function () {
		let cartCheckoutPage: CartCheckoutPage;

		it( 'Screenshot Login page and navigate to Signup page', async function () {
			const loginPage = new LoginPage( page );
			await loginPage.visit();
			await page.screenshot( { path: 'login.png', fullPage: true } );
			await loginPage.signup();
		} );

		it( 'Set store cookie', async function () {
			await BrowserManager.setStoreCookie( page, { currency: 'GBP' } );
		} );

		it( 'Screenshot signup page and sign up as new user', async function () {
			const userSignupPage = new UserSignupPage( page );
			await page.screenshot( { path: 'signup.png', fullPage: true } );
			await userSignupPage.signup( email, username, signupPassword );
		} );

		it( 'Select a free .wordpress.com domain', async function () {
			const domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.search( blogName );
			await domainSearchComponent.selectDomain( '.wordpress.com' );
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
			await cartCheckoutPage.enterPaymentDetails( paymentDetails );
		} );

		it( 'Take screenshot of checkout page', async function () {
			const archive = archiver( 'zip', {
				zlib: { level: 9 }, // Sets the compression level.
			} );
			const output = fs.createWriteStream( 'test-screenshots-1.zip' );
			archive.pipe( output );
			archive.append( fs.createReadStream( 'login.png' ), { name: 'login.png' } );
			archive.append( fs.createReadStream( 'signup.png' ), { name: 'signup.png' } );
			archive.append( fs.createReadStream( 'checkout.png' ), { name: 'checkout.png' } );
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

			const navbarComponent = new NavbarComponent( page );
			await navbarComponent.clickCloseCheckout();
		} );
	} );

	describe( 'Delete user account', function () {
		it( 'Close account', async function () {
			const closeAccountFlow = new CloseAccountFlow( page );
			await closeAccountFlow.closeAccount();
		} );
	} );
} );
