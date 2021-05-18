/**
 * Internal dependencies
 */
import * as DataHelper from '../../data-helper';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

export class LoginPage {
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
	 * Executes series of interactions on the log-in page to login as a specific user.
	 *
	 * @param {Object} param0 Key/value pair holding the login credentials for a user.
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
		await this.page.waitForSelector( this.loginContainerSelector );
		await this.page.waitForSelector( this.usernameSelector );

		await this.page.fill( this.usernameSelector, username );
		await this.page.keyboard.press( 'Enter' );

		await this.page.waitForSelector( this.passwordSelector );
		await this.page.fill( this.passwordSelector, password );

		try {
			await Promise.all( [ this.page.waitForNavigation(), this.page.keyboard.press( 'Enter' ) ] );
		} catch ( err ) {
			throw new Error( 'Failed to log in.' );
		}
	}
}
