/**
 *
 */

import {
	DataHelper,
	LoginPage,
	UserSignupPage,
	CloseAccountFlow,
	EmailClient,
	SecretsManager,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Signup: WordPress.com WPCC' ), function () {
	const testUser = DataHelper.getNewTestUser( {
		usernamePrefix: 'wpcc',
	} );
	const emailClient = new EmailClient();

	let page: Page;

	beforeAll( async () => {
		page = await browser.newPage();
	} );

	describe( 'Signup via /start/wpcc', function () {
		let activationLink: string;

		it( 'Navigate to CrowdSignal WPCC endpoint', async function () {
			const calypsoBaseURL = DataHelper.getCalypsoURL();
			const wpccAuthPath = SecretsManager.secrets.wpccAuthPath;
			console.log( calypsoBaseURL + wpccAuthPath );
			await page.goto( calypsoBaseURL + wpccAuthPath );
		} );

		it( 'Create a new WordPress.com account', async function () {
			const userSignupPage = new UserSignupPage( page );
			await userSignupPage.signupWPCC( testUser.email, testUser.password );
		} );

		it( 'User lands in CrowdSignal dashboard', async function () {
			// This will be a production site instead of staging or wpcalypso.
			await page.waitForSelector( 'div.welcome-main' );
		} );

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

	describe( 'Navigate to WordPress.com', function () {
		it( 'Navigate to WordPress.com', async function () {
			// Cursory check to ensure the newly registered account does not have a site.
			// Waiting for `networkidle` is required so Calypso loading won't swallow up
			// the click on navbar in the Close Account steps.
			await Promise.all( [
				page.waitForNavigation( { url: '**/read', waitUntil: 'load' } ),
				page.goto( DataHelper.getCalypsoURL() ),
			] );
		} );
	} );

	describe( 'Delete user account', function () {
		it( 'Close account', async function () {
			const closeAccountFlow = new CloseAccountFlow( page );
			await closeAccountFlow.closeAccount();
		} );
	} );

	describe( 'Ensure account is no longer accessible', function () {
		let loginPage: LoginPage;

		beforeAll( async () => {
			loginPage = new LoginPage( page );
		} );

		it( 'Go to WordPress.com Login page', async function () {
			await loginPage.visit();
		} );

		it( 'Ensure user is unable to log in', async function () {
			await loginPage.fillUsername( testUser.email );
			await loginPage.clickSubmit();
			await loginPage.fillPassword( testUser.password );
			await loginPage.clickSubmit();

			await page.waitForSelector( 'text=This account has been closed' );
		} );
	} );
} );
