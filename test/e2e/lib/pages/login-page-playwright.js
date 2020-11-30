/**
 * External dependencies
 */
import playwright from 'playwright';

/**
 * Internal dependencies
 */
import * as dataHelper from '../data-helper';

// This is the Calypso WordPress.com login page
// For the wp-admin login page see /wp-admin/wp-admin-logon-page
export default class LoginPage {
    constructor(page) {
        // Accepts an instance of a page object.
        this.page = page;
        // Instead of passing the URL as parameter to the parent class,
        // simply set it as an attribute of this class instance.
        this.url = LoginPage.getLoginURL();
    }

    async login( username, password, emailSSO = false ) {
        // Establish CSS class selectors.
        const userNameSelector = "#usernameOrEmail";
        const passwordSelector = "#password";
        const loginContainer = ".wp-login__container";
        
        const page = this.page;
        
        await page.waitForSelector( loginContainer );
        await page.waitForSelector( userNameSelector );

        await page.fill( userNameSelector, username );
        await page.keyboard.press("Enter")
        
        await page.waitForSelector( passwordSelector) ;
        await page.fill( passwordSelector, password );
        await page.keyboard.press("Enter");

        // Check if My Home header appears.
        // Note, I am not fond of this method, as the element does not belong to LoginPage object.
        // It would be better to check for lack of an element that should be present at 
        // login page or check that URL string no longer contains wp-login.
        return await page.waitForSelector( ".customer-home__heading", {visible: true} );
    }

    static getLoginURL() {
		return dataHelper.getCalypsoURL( 'log-in' );
	}
}