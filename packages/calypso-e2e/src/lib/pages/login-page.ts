import { Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

const selectors = {
	loginContainer: '.wp-login__container',

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
	magicLinkSentMessage: ':text("We just emailed you a link.")',
	magicLinkContinueLoginButton: ':text("Continue to WordPress.com")',
};

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

	/**
	 * Initialization steps for the page.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	private async pageSettled(): Promise< void > {
		// Needs to be `networkidle`, otherwise switching accounts will fail.
		await this.page.waitForLoadState( 'networkidle' );
		const container = await this.page.waitForSelector( selectors.loginContainer );
		// The login container can fade in or shift, so wait for that to complete.
		await container.waitForElementState( 'stable' );
	}

	/**
	 * Switch account if an user is already logged in.
	 */
	private async switchAccount(): Promise< void > {
		// By default, log out of the existing account (even if test steps end up logging back in).
		const alreadyLoggedIn = await this.page.$( selectors.changeAccountButton );
		if ( alreadyLoggedIn ) {
			console.log( 'already logged in, selecting "change account' );
			await this.page.click( selectors.changeAccountButton );
		}
	}

	/**
	 * Executes series of interactions on the log-in page to log in as a specific user.
	 *
	 * @param {Object} param0 Key/value pair holding the credentials for a user.
	 * @param {string} param0.username Username of the user.
	 * @param {string} param0.password Password of the user.
	 * @returns {Promise<void>} No return value.
	 */
	async login( { username, password }: { username: string; password: string } ): Promise< void > {
		await this.pageSettled();

		await this.switchAccount();

		// Begin the process of logging in.
		await this.page.fill( selectors.username, username );
		await this.page.keyboard.press( 'Enter' );
		await this.page.fill( selectors.password, password );
		await this.page.click( selectors.loginButton );
		// Make sure after logging in that everything stablizes, so we can continue with the next action!
		await this.page.waitForLoadState( 'load' );
	}

	/**
	 * Navigates to the Login page.
	 */
	async visit(): Promise< void > {
		await this.page.goto( getCalypsoURL( 'log-in' ), { waitUntil: 'networkidle' } );
	}

	/**
	 * Clicks on a link to navigate to the account signup page.
	 */
	async clickSignup(): Promise< void > {
		await this.visit();
		await this.pageSettled();

		await this.switchAccount();
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.createAccountLnk ),
		] );
	}

	/**
	 * Given an email address or username, request a magic link for the user.
	 *
	 * @param {string} user Username or email address of the user requesting a link.
	 */
	async requestMagicLink( user: string ): Promise< void > {
		await this.page.click( selectors.requestMagicLoginLink );
		await this.page.fill( selectors.magicLinkUserInput, user );
		await this.page.click( selectors.requestMagicLoginButton );
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
