/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

const selectors = {
	loginContainer: '.wp-login__container',
	username: '#usernameOrEmail',
	password: '#password',
	changeAccountButton: '#loginAsAnotherUser',
};

/**
 * Represents an instance of the calypso Login page.
 *
 * @augments {BaseContainer}
 */
export class LoginPage extends BaseContainer {
	/**
	 * Creates an instance of the Login page.
	 *
	 * @param {Page} page Playwright page on which actions are executed.
	 */
	constructor( page: Page ) {
		super( page );
	}

	/**
	 * Executes series of interactions on the log-in page to log in as a specific user.
	 *
	 * @param {Object} param0 Key/value pair holding the credentials for a user.
	 * @param {string} param0.username Username of the user.
	 * @param {string} param0.password Password of the user.
	 * @returns {Promise<void>} No return value.
	 * @throws {Error} If the log in process was unsuccessful for any reason.
	 */
	async login( { username, password }: { username: string; password: string } ): Promise< void > {
		// Wait for the fade in animation to complete.
		const loginContainer = await this.page.waitForSelector( selectors.loginContainer );
		await loginContainer.waitForElementState( 'stable' );

		const alreadyLoggedIn = await this.page.isVisible( selectors.changeAccountButton );
		if ( alreadyLoggedIn ) {
			console.log( 'already logged in, selecting "change account"' );
			await this.page.click( selectors.changeAccountButton );
		}

		// Begin the process of logging in.
		await this.page.fill( selectors.username, username );
		await this.page.keyboard.press( 'Enter' );
		await this.page.fill( selectors.password, password );

		// Enter submits the form and initiates the log in process.
		await this.page.keyboard.press( 'Enter' );
	}
}
