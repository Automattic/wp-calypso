import { Page } from 'playwright';
import { getCalypsoURL, getAccountCredential } from '../../data-helper';

const selectors = {
	loginContainer: '.wp-login__container',
	continueAsUser: '.continue-as-user',

	// Login
	loginButton: 'button:has-text("Log In")',
	username: '#usernameOrEmail',
	password: '#password',
	changeAccountButton: '#loginAsAnotherUser',

	// Signup
	createAccountLink: ':text("Create a new account")',

	// Magic login
	requestMagicLoginLink: 'a[data-e2e-link="magic-login-link"]',
	magicLinkUserInput: 'input[name="usernameOrEmail"]',
	requestMagicLoginButton: 'button:text("Request Email")',
	magicLinkSentMessage: ':text-matches("We just emailed")',
	magicLinkContinueLoginButton: ':text("Continue to WordPress.com")',

	// Notices
	noticeBox: '.notice',
};

interface LoginCredentials {
	username: string;
	password: string;
}
interface TestAccount {
	account: string;
}

interface LoginOptions {
	landingUrl?: string;
}

/**
 * Represents an instance of the calypso Login page.
 */
export class LoginPage {
	private page: Page;
	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/* Helper methods */

	/**
	 * Initialization steps for the page.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	private async pageSettled(): Promise< void > {
		// Needs to be `networkidle`, otherwise switching accounts will fail.
		await this.page.waitForLoadState( 'networkidle' );
	}

	/**
	 * Navigates to the /log-in endpoint.
	 */
	async visit(): Promise< void > {
		await this.page.goto( getCalypsoURL( 'log-in' ), { waitUntil: 'networkidle' } );
	}

	/**
	 * Switch account if an user is already logged in.
	 */
	private async revealLoginForm(): Promise< void > {
		await this.pageSettled();

		// Change account button takes some time to fade into view if an account
		// is already logged in.
		const alreadyLoggedIn = await this.page.isVisible( selectors.continueAsUser );
		if ( alreadyLoggedIn ) {
			const elementHandle = await this.page.waitForSelector( selectors.continueAsUser );
			await elementHandle.waitForElementState( 'stable' );
			await this.page.click( selectors.changeAccountButton );
		}
	}

	/**
	 * Fills out the login form then submit.
	 *
	 * If the credentials are rejected by the WordPress.com backend for any reason, this method
	 * will throw.
	 *
	 * @param param0 LoginCredentials object.
	 * @param {string} param0.username User name.
	 * @param {string} param0.password Password.
	 * @throws {Error} If credentials are rejected. Contains the text within the notice box.
	 */
	private async baseflow( { username, password }: LoginCredentials ): Promise< void > {
		await this.page.fill( selectors.username, username );
		await this.page.keyboard.press( 'Enter' );
		await this.page.fill( selectors.password, password );

		await this.page.click( selectors.loginButton );

		// Wait for the response from the login endpoint.
		const response = await this.page.waitForResponse( '**/wp-login.php?action=login-endpoint' );

		// If the account credentials are rejected, throw an error containing the text of
		// the notice box.
		if ( response.status() === 400 ) {
			throw new Error(
				await this.page
					.waitForSelector( selectors.noticeBox )
					.then( ( element ) => element.innerText() )
			);
		}
	}

	/**
	 *
	 */
	private async resolveUserCredentials(
		requestedCredentials: LoginCredentials | TestAccount
	): Promise< LoginCredentials > {
		let username;
		let password;

		if ( 'account' in requestedCredentials ) {
			// Test Account specified. Look for the corresponding username/password
			// combination from the configuration file.
			[ username, password ] = getAccountCredential( requestedCredentials.account );
		} else {
			// Regular username/password pair specified - destructure it.
			( { username, password } = requestedCredentials );
		}
		return { username: username, password: password };
	}

	/* Log in methods */

	/**
	 * Log in to WordPress.com from the `/log-in` endpoint.
	 *
	 * This is the 'normal' or 'standard' way of performing log ins.
	 *
	 * @param {LoginCredentials | TestAccount} credentials Credentials of the user. Specify either an username/password pair or name of a test account in the configuration.
	 * @param {LoginOptions} options Options for the login method.
	 */
	async login(
		credentials: LoginCredentials | TestAccount,
		options?: LoginOptions
	): Promise< void > {
		await this.visit();
		await this.revealLoginForm();

		// Obtain sanitized username/password combination.
		const { username, password } = await this.resolveUserCredentials( credentials );

		// The `waitForNavigation` method triggered after clicking on the Log In button will wait for a
		// customn URL if `options.landingUrl` is specified.
		// This is useful if after logging into Calypso the redirect takes user away from the default
		// redirect of `<host>/home/<blogUrl>.
		const landingUrl = options?.landingUrl ? options.landingUrl : `**/home/**`;

		await Promise.all( [
			this.page.waitForNavigation( { url: landingUrl, waitUntil: 'load' } ),
			this.baseflow( { username, password } ),
		] );
	}

	/**
	 * Log in to WordPress.com from a popup window, triggered by interaction on a published WordPress.com page.
	 *
	 * @param {LoginCredentials | TestAccount} credentials Credentials of the user. Specify either an username/password pair or name of a test account in the configuration.
	 */
	async loginFromPopup( credentials: LoginCredentials | TestAccount ): Promise< void > {
		const { username, password } = await this.resolveUserCredentials( credentials );

		await Promise.all( [
			this.page.waitForNavigation( { waitUntil: 'load' } ),
			this.baseflow( { username, password } ),
		] );
	}

	/* Signup */

	/**
	 * Visit the Login page and click on the signup link for a new account.
	 */
	async signup(): Promise< void > {
		await this.visit();
		await this.revealLoginForm();

		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.createAccountLink ),
		] );
	}

	/* Magic Links */

	/**
	 * Given an email address or username, request a magic link for the user.
	 *
	 * This method requires the user to be on the main Login page.
	 *
	 * @param {string} user Username or email address of the user requesting a link.
	 */
	async requestMagicLink( user: string ): Promise< void > {
		await this.visit();
		await this.revealLoginForm();

		await this.page.click( selectors.requestMagicLoginLink );
		await this.page.fill( selectors.magicLinkUserInput, user );
		await this.page.click( selectors.requestMagicLoginButton );
		// Confirm the magic link request is successful.
		await this.page.waitForSelector( selectors.magicLinkSentMessage );
	}

	/**
	 * Given a magic link, navigate to and confirm login.
	 *
	 * @param {string} url URL of the magic link.
	 */
	async followMagicLink( url: string ): Promise< void > {
		const sanitizedURL = new URL( url );
		await this.page.goto( sanitizedURL.toString() );
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.magicLinkContinueLoginButton ),
		] );
	}
}
