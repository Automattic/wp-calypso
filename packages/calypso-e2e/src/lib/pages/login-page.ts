/**
 * Internal dependencies
 */
import * as DataHelper from '../../data-helper';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

/**
 * Represents an instance of the calypso Login page.
 */
export class LoginPage {
	/**
	 * Creates an instance of the Login page.
	 *
	 * @param {Page} page Playwright page on which actions are executed.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.url = DataHelper.getCalypsoURL( 'log-in' );
	}

	page: Page;
	url: string;

	loginContainerSelector = '.wp-login__container';
	usernameSelector = '#usernameOrEmail';
	passwordSelector = '#password';
	changeAccountSelector = '#loginAsAnotherUser';
	alreadyLoggedInSelector = '.continue-as-user';

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
		await this.page.goto( this.url, { waitUntil: 'networkidle' } );

		const alreadyLoggedIn = await this.page.$( this.changeAccountSelector );
		if ( alreadyLoggedIn ) {
			await this.page.click( this.changeAccountSelector );
		}

		// Begin the process of logging in.
		await this.page.fill( this.usernameSelector, username );
		await this.page.keyboard.press( 'Enter' );

		await this.page.fill( this.passwordSelector, password );

		// Wait for all promises. Add more here as necessary, such as waiting for the request to be
		// completed, or looking for a specific elemen on page.
		await Promise.all( [ this.page.waitForNavigation(), this.page.keyboard.press( 'Enter' ) ] );
	}
}
