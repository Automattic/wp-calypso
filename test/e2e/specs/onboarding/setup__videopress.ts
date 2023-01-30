/**
 * @group quarantined
 */

import {
	DataHelper,
	UserSignupPage,
	BrowserManager,
	EmailClient,
	NewUserResponse,
	RestAPIClient,
	DomainSearchComponent,
	CartCheckoutPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'VideoPress Tailored Onboarding' ), () => {
	const testUser = DataHelper.getNewTestUser( {
		usernamePrefix: 'videopress_onboarding',
	} );
	const emailClient = new EmailClient();
	let page: Page;
	let domainSearchComponent: DomainSearchComponent;
	let cartCheckoutPage: CartCheckoutPage;
	let newUserDetails: NewUserResponse;

	beforeAll( async () => {
		page = await browser.newPage();
		await BrowserManager.setStoreCookie( page, { currency: 'EUR' } );
	} );

	describe( 'Signup via /setup/videopress', function () {
		let activationLink: string;
		it( 'Navigate to /setup/videopress', async function () {
			await page.goto( DataHelper.getCalypsoURL( '/setup/videopress' ) );
		} );

		it( 'Click Get Started', async function () {
			await Promise.all( [ page.waitForNavigation(), page.click( 'text=Get started' ) ] );
		} );

		it( 'Navigate VideoMaker Setup', async function () {
			await page.waitForURL( /.*videomakerSetup.*/ );
			await page.click( 'button.videomaker-setup__dark-button' );
		} );

		it( 'Enter account details', async function () {
			await page.waitForURL( /.*videopress-account.*/ );
			const userSignupPage = new UserSignupPage( page );
			newUserDetails = await userSignupPage.signup(
				testUser.email,
				testUser.username,
				testUser.password
			);
		} );

		it( 'Navigate to site options', async function () {
			await page.waitForURL( /.*options.*/ );
		} );

		it( 'Fill Site Options', async function () {
			await page.waitForSelector( 'form.site-options__form' );
			await page.fill( 'input[name="siteTitle"]', `Video site ${ testUser.username }` );
			await page.fill( 'textarea[name="tagline"]', `The place of ${ testUser.username }` );
			await page.click( 'button.site-options__submit-button' );
		} );

		it( 'Navigate choose a domain', async function () {
			await page.waitForSelector( '#choose-a-domain-header' );
		} );
		it( 'Search for a domain', async function () {
			domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.search( testUser.username );
		} );

		it( 'Skip selecting a domain', async function () {
			await Promise.all( [ page.waitForNavigation(), page.click( 'text=Decide later' ) ] );
		} );

		it( 'Navigate to choose a plan', async function () {
			await page.waitForURL( /.*chooseAPlan.*/ );
			await page.click( 'button.plan-item__select-button' );
		} );

		it( 'Land in checkout cart', async function () {
			cartCheckoutPage = new CartCheckoutPage( page );
			const totalAmount = await cartCheckoutPage.getCheckoutTotalAmount();
			expect( totalAmount ).toBeGreaterThan( 0 );
		} );

		it( 'Enter billing and payment details', async function () {
			const paymentDetails = DataHelper.getTestPaymentDetails();
			await cartCheckoutPage.enterBillingDetails( paymentDetails );
			await cartCheckoutPage.enterPaymentDetails( paymentDetails );
		} );

		it( 'Make purchase', async function () {
			await cartCheckoutPage.purchase( { timeout: 90 * 1000 } );
		} );

		it( 'Skip upsell if present', async function () {
			const selector = 'button[data-e2e-button="decline"]';
			const locator = page.locator( selector );

			try {
				await locator.click( { timeout: 2 * 1000 } );
			} catch {
				// noop
			}
		} );

		it( 'Navigate to launchpad', async function () {
			await page.waitForURL( /.*launchpad.*/ );
		} );

		// This happens after we finish signup.
		it( 'Get activation link', async function () {
			const message = await emailClient.getLastMatchingMessage( {
				inboxId: testUser.inboxId,
				sentTo: testUser.email,
				subject: 'Activate',
			} );
			const links = await emailClient.getLinksFromMessage( message );
			activationLink = links.find( ( link: string ) => link.includes( 'activate' ) ) as string;
		} );

		it( 'Activate account', async function () {
			await page.goto( activationLink );
		} );
	} );

	afterAll( async function () {
		if ( ! newUserDetails ) {
			return;
		}

		const restAPIClient = new RestAPIClient(
			{
				username: testUser.username,
				password: testUser.password,
			},
			newUserDetails.body.bearer_token
		);

		await apiCloseAccount( restAPIClient, {
			userID: newUserDetails.body.user_id,
			username: newUserDetails.body.username,
			email: testUser.email,
		} );
	} );
} );
