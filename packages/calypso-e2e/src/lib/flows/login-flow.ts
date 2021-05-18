/**
 * Internal dependencies
 */
import { LoginPage } from '../pages/login-page';
import { getAccountCredential } from '../../data-helper';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

export class LoginFlow {
	page: Page;
	username: string;
	password: string;

	constructor( page: Page, accountType = 'defaultUser' ) {
		this.page = page;

		// Ignoring the last portion of the destructure (siteURL) because
		// it is not useful to us yet.
		const [ username, password ] = getAccountCredential( accountType );
		this.username = username;
		this.password = password;
	}

	/**
	 * Executes the end-to-end steps of logging into WPCOM as a user.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async baseflow(): Promise< void > {
		const loginPage = new LoginPage( this.page );
		await loginPage.login( { username: this.username, password: this.password } );
	}

	async login(): Promise< void > {
		await this.baseflow();
	}
}
