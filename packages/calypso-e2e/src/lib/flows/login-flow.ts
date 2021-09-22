import { Page } from 'playwright';
import { getAccountCredential, getCalypsoURL } from '../../data-helper';
import { LoginPage } from '../pages';

/**
 * A username/password set of credentials that can be used to log in.
 */
export interface LoginCredentials {
	username: string;
	password: string;
}

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
	 * @param {Page} page Object representing the base page.
	 * @param {string} [account] Account information to be used to login. Can be either an account type from config, or credentials.
	 */
	constructor( page: Page, account: string | LoginCredentials = 'defaultUser' ) {
		this.page = page;

		if ( typeof account === 'string' ) {
			const [ username, password ] = getAccountCredential( account );
			this.username = username;
			this.password = password;
		} else {
			this.username = account.username;
			this.password = account.password;
		}
	}

	/**
	 * Executes the common steps of logging in as a particular user.
	 * Typically, this method should not be called directly by the test writer as
	 * other login methods perform additional checks and waits.
	 *
	 * @param {Page} page Page on which the login interactions should occur. This is not necessarily
	 * the same page as the base page where the test is being executed.
	 * @returns {Promise<void>} No return value.
	 */
	async baseflow( page?: Page ): Promise< void > {
		console.log( '\tLogging in as ' + this.username );

		// Unless a page object has explictly been passed into this method, assume the login process
		// can execute on the same page object that was passed into the constructor of this flow.
		if ( ! page ) {
			page = this.page;
		}

		const loginPage = new LoginPage( page );
		await loginPage.login( { username: this.username, password: this.password } );
	}

	/* Log in abstraction methods */

	/**
	 * Log in as the specified user from the WPCOM Log-In endpoint.
	 * This is the most basic action of logging in.
	 *
	 * Sometimes when logging into a site, there will be a redirect to the site specific page,
	 * e.g. wordpress.com > wordpress.com/home/site. You can provide the specific URL we should be waiting
	 * for before continuing to get around this.
	 *
	 * @param {object} root0 Root keyed object for optional options
	 * @param {string | undefined} root0.landingUrl The URL we must navigate to before continuing. Use to handle home redirect.
	 * @returns {Promise<void>} No return value.
	 */
	async logIn( { landingUrl }: { landingUrl?: string } = {} ): Promise< void > {
		await this.page.goto( getCalypsoURL( 'log-in' ) );
		await Promise.all( [ this.page.waitForNavigation( { url: landingUrl } ), this.baseflow() ] );
	}

	/**
	 * Log in as the specified user from a popup, typically triggered while logged out.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async logInFromPopup(): Promise< void > {
		// Popup emits the event 'popup'. Capturing the event obtains the Page object
		// for the popup page, where the login form is located.
		// For more information, see https://playwright.dev/docs/multi-pages#handling-popups
		// under 'unknown trigger'.
		const popupPage = await this.page.waitForEvent( 'popup' );

		await popupPage.waitForLoadState( 'networkidle' );

		// Execute the login steps using the popup page, not the base page.
		await this.baseflow( popupPage );

		// Wait for the popup to be closed before passing control back.
		await popupPage.waitForEvent( 'close' );
	}
}
