/**
 * Internal dependencies
 */
import { LoginPage, MyHomePage } from '../pages';
import { getAccountCredential } from '../../data-helper';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

/**
 * Class representing the end-to-end log in process.
 */
export class LoginFlow {
	page: Page;
	username: string;
	password: string;

	/**
	 * Creates an instance of the log in flow.
	 *
	 * @param {Page} page Instance of a Playwright page on which test steps are executing.
	 * @param {string} [accountType] Type of account to be used for the log in process.
	 */
	constructor( page: Page, accountType = 'defaultUser' ) {
		this.page = page;

		// Ignoring the last portion of the destructure (siteURL) because
		// it is not useful to us yet.
		const [ username, password ] = getAccountCredential( accountType );
		this.username = username;
		this.password = password;
	}

	/**
	 * Executes the basic log in flow as the specified user.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async baseflow(): Promise< void > {
		console.log( 'Logging in as ' + this.username );
		const loginPage = new LoginPage( this.page );
		await loginPage.login( { username: this.username, password: this.password } );
	}

	/**
	 * Log in as the user without performing any additional steps.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async login(): Promise< void > {
		await this.baseflow();
		await MyHomePage.Expect( this.page );
	}
}
