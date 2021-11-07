/**
 * @group calypso-release
 */

import {
	DataHelper,
	LoginPage,
	setupHooks,
	UserSignupPage,
	CloseAccountFlow,
	EmailClient,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Signup: WordPress.com WPCC' ), function () {
	const inboxId = DataHelper.config.get( 'signupInboxId' ) as string;
	const username = `e2eflowtestingwpcc${ DataHelper.getTimestamp() }`;
	const email = DataHelper.getTestEmailAddress( {
		inboxId: inboxId,
		prefix: username,
	} );
	const signupPassword = DataHelper.config.get( 'passwordForNewTestSignUps' ) as string;

	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( 'Signup via /start/wpcc', function () {
		let activationLink: string;

		it( 'Navigate to CrowdSignal WPCC endpoint', async function () {
			const calypsoBaseURL = DataHelper.getCalypsoURL();
			const wpccAuthPath = DataHelper.config.get( 'wpccAuthPath' );
			console.log( calypsoBaseURL + wpccAuthPath );
			await page.goto( calypsoBaseURL + wpccAuthPath );
		} );

		it( 'Create a new WordPress.com account', async function () {
			const userSignupPage = new UserSignupPage( page );
			await userSignupPage.signupWPCC( email, signupPassword );
		} );

		it( 'User lands in CrowdSignal dashboard', async function () {
			// This will be a production site instead of staging or wpcalypso.
			await page.waitForSelector( 'div.welcome-main' );
		} );

		it( 'Get activation link', async function () {
			const emailClient = new EmailClient();
			const message = await emailClient.getLastEmail( {
				inboxId: inboxId,
				emailAddress: email,
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
			await page.goto( DataHelper.getCalypsoURL(), { waitUntil: 'networkidle' } );
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
		it( 'Navigate to WordPress.com Login page', async function () {
			loginPage = new LoginPage( page );
			await loginPage.visit();
		} );

		it( 'Ensure user is unable to log in', async function () {
			expect( loginPage.login( { username: email, password: signupPassword } ) ).rejects.toThrow();
		} );
	} );
} );
