/**
 * @group calypso-release
 */

import {
	DataHelper,
	UserSignupPage,
	BrowserManager,
	EmailClient,
	NewUserResponse,
	RestAPIClient,
	DomainSearchComponent,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Signup: Tailored VideoPress' ), () => {
	const testUser = DataHelper.getNewTestUser( {
		usernamePrefix: 'videoprss_onboarding', // removed the `e` from `press` because `videopress` is a blocked term for domains.
	} );
	const emailClient = new EmailClient();
	let page: Page;
	let domainSearchComponent: DomainSearchComponent;
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
			// Return a button "key" for the button that is found on page.
			const startButtonText = 'Start a free trial';
			await page.getByText( startButtonText ).click();
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
			await page.getByText( 'Decide later' ).click();
		} );

		it( 'Land in processing', async function () {
			await page.waitForURL( /.*processing.*/, { timeout: 20 * 1000 } );
		} );
		it( 'Navigate to site editor', async function () {
			await page.waitForURL( /.*site-editor.*/, { timeout: 20 * 1000 } );
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
