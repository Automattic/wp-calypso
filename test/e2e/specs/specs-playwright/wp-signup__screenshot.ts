/**
 * @group calypso-release
 */

import {
	DataHelper,
	DomainSearchComponent,
	LoginPage,
	CartCheckoutPage,
	setupHooks,
	UserSignupPage,
	SignupPickPlanPage,
	BrowserHelper,
	CloseAccountFlow,
	NavbarComponent,
	BrowserManager,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

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
			let form = new FormData();
			form.append( 'my_file', fs.createReadStream( 'login.png' ) );
			await fetch( 'https://public-api.wordpress.com/wpcom/v2/screenshots', {
				method: 'POST',
				body: form,
			} )
			.then( response => response.json())
			.then( response => expect( response?.upload_status ).toStrictEqual( 'success' ) );
			await loginPage.signup();
		} );

		it( 'Set store cookie', async function () {
			await BrowserManager.setStoreCookie( page, { currency: 'GBP' } );
		} );

		it( 'Screenshot signup page and sign up as new user', async function () {
			const userSignupPage = new UserSignupPage( page );
			await page.screenshot( { path: 'signup.png', fullPage: true } );
			let form = new FormData();
            form.append( 'my_file', fs.createReadStream( 'signup.png' ) );
            await fetch( 'https://public-api.wordpress.com/wpcom/v2/screenshots', {
            	method: 'POST',
                body: form,
            } )
            .then( response => response.json())
            .then( response => expect( response?.upload_status ).toStrictEqual( 'success' ) );
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
			await page.screenshot( { path: 'checkout.png', fullPage: true } );
			let form = new FormData();
            form.append( 'my_file', fs.createReadStream( 'checkout.png' ) );
            await fetch( 'https://public-api.wordpress.com/wpcom/v2/screenshots', {
            	method: 'POST',
                body: form,
            } )
            .then( response => response.json())
            .then( response => expect( response?.upload_status ).toStrictEqual( 'success' ) );
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
