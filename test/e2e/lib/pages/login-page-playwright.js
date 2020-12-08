/**
 * Internal dependencies
 */
import * as dataHelper from '../data-helper';

// This is the Calypso WordPress.com login page
// For the wp-admin login page see /wp-admin/wp-admin-logon-page
export default class LoginPage {
	constructor( page ) {
		// Accepts an instance of a page object.
		this.page = page;
		// Set the login URL as an attribute of this page.
		this.url = LoginPage.getLoginURL();
	}

	async login( username, password ) {
		// Establish CSS class selectors.
		const userNameSelector = '#usernameOrEmail';
		const passwordSelector = '#password';
		const loginContainer = '.wp-login__container';
		const changeAccountSelector = '#loginAsAnotherUser';

		// Retrive the page object.
		const page = this.page;

		// If there is already a logged in session.
		const alredyLoggedIn = await page.$( changeAccountSelector );
		if ( alredyLoggedIn ) {
			await page.click( changeAccountSelector );
		}

		// Begin the process of logging in.
		await page.waitForSelector( loginContainer );
		await page.waitForSelector( userNameSelector );

		await page.fill( userNameSelector, username );
		await page.keyboard.press( 'Enter' );

		await page.waitForSelector( passwordSelector );
		await page.fill( passwordSelector, password );

		// Wait for the sidebar to be loaded in the dashbaord before resolving the promise.
		return await Promise.all( [
			page.waitForResponse(
				'https://wordpress.com/calypso/evergreen/async-load-calypso-my-sites-sidebar**'
			),
			page.keyboard.press( 'Enter' ),
		] );
	}

	static getLoginURL() {
		return dataHelper.getCalypsoURL( 'log-in' );
	}
}
