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
	createAccountLnk: ':text("Create a new account")',

	// Magic login
	requestMagicLoginLink: 'a[data-e2e-link="magic-login-link"]',
	magicLinkUserInput: 'input[name="usernameOrEmail"]',
	requestMagicLoginButton: 'button:text("Request Email")',
	magicLinkSentMessage: ':text-matches("We just emailed")',
	magicLinkContinueLoginButton: ':text("Continue to WordPress.com")',
};

interface LoginCredentials {
	username: string;
	password: string;
}
interface TestAccount {
	account: string;
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
	private async switchAccount(): Promise< void > {
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
	 * The basic flow of filling out username/email and password into the form then submitting.
	 *
	 * Call this method from any page to log into WordPress.com.
	 *
	 * @param param0 LoginCredentials object.
	 * @param {string} param0.username User name.
	 * @param {string} param0.password Password.
	 */
	private async baseflow( { username, password }: LoginCredentials ): Promise< void > {
		await this.page.fill( selectors.username, username );
		await this.page.keyboard.press( 'Enter' );
		await this.page.fill( selectors.password, password );
		// Wait for navigation to resolve in a regular login.
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.loginButton ),
		] );
		// After navigation resolves, wait for `load` state to fire.
		await this.page.waitForLoadState( 'load' );
	}

	/* Log in methods */

	/**
	 * Log in to WordPress.com from the `/log-in` endpoint.
	 *
	 * This is the 'normal' or 'standard' way of performing log ins.
	 *
	 * @param {LoginCredentials | TestAccount} credentials Credentials of the user. Specify either an username/password pair or name of a test account in the configuration.
	 */
	async login( credentials: LoginCredentials | TestAccount ): Promise< void > {
		await this.visit();
		await this.switchAccount();

		let username;
		let password;

		if ( 'account' in credentials ) {
			// Test Account specified. Look for the corresponding username/password
			// combination from the configuration file.
			[ username, password ] = getAccountCredential( credentials.account );
		} else {
			// Regular username/password pair specified - destructure it.
			( { username, password } = credentials );
		}

		await this.baseflow( { username, password } );
	}

	/* Signup */

	/**
	 * Visit the Login page and click on the signup link for a new account.
	 */
	async signup(): Promise< void > {
		await this.visit();
		await this.switchAccount();

		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.createAccountLnk ),
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
		await this.switchAccount();

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
