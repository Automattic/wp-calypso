import { Page } from 'playwright';

const selectors = {
	loginContainer: '.wp-login__container',
	loginButton: 'button:has-text("Log In")',
	username: '#usernameOrEmail',
	password: '#password',
	changeAccountButton: '#loginAsAnotherUser',
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
		await this.page.waitForLoadState( 'load' );
		// The login container can fade in or shift, so wait for that to complete.
		const container = await this.page.waitForSelector( selectors.loginContainer );
		await container.waitForElementState( 'stable' );
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

		// By default, log out of the existing account (even if test steps end up logging back in).
		const alreadyLoggedIn = await this.page.$( selectors.changeAccountButton );
		if ( alreadyLoggedIn ) {
			console.log( 'already logged in, selecting "change account' );
			await this.page.click( selectors.changeAccountButton );
		}

		// Begin the process of logging in.
		await this.page.fill( selectors.username, username );
		await this.page.keyboard.press( 'Enter' );
		await this.page.fill( selectors.password, password );
		await this.page.click( selectors.loginButton );
		// Make sure after logging in that everything stablizes, so we can continue with the next action!
		await this.page.waitForLoadState( 'load' );
	}
}
