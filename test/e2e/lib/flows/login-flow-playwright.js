/**
 * External dependencies
 */
import playwright from 'playwright';

/**
 * Internal dependencies
 */
import LoginPage from '../pages/login-page-playwright.js';

import * as dataHelper from '../data-helper';

const host = dataHelper.getJetpackHost();

export default class LoginFlow {
    constructor( browser, accountOrFeatures ) {
        // Reference to an instance of the browser is passed in as a parameter.
        this.browser = browser;
        // Create a new context, which can be thought of as a new session/window
        // containing a clean profile.
        this.context = browser.newContext();

        // The following if/else is essentially carried over from the
        // original file.
        accountOrFeatures = accountOrFeatures || 'defaultUser';
        if ( typeof accountOrFeatures === 'string' ) {
            const legacyConfig = dataHelper.getAccountConfig( accountOrFeatures );
            if ( ! legacyConfig ) {
				throw new Error( `Account key '${ accountOrFeatures }' not found in the configuration` );
            }
            
			this.account = {
				email: legacyConfig[ 0 ],
				username: legacyConfig[ 0 ],
				password: legacyConfig[ 1 ],
				loginURL: legacyConfig[ 2 ],
				legacyAccountName: accountOrFeatures,
			};
		} else {
			this.account = dataHelper.pickRandomAccountWithFeatures( accountOrFeatures );
			if ( ! this.account ) {
				throw new Error(
					`Could not find any account matching features '${ accountOrFeatures.toString() }'`
				);
			}
		}
    }   

    async login() {
        console.log( 'Logging in as ' + this.account.username );

        // Retrieve the context created in the constructor.
        const context = await this.context;
        // Launch a new page/tab in the context.
        const page = await context.newPage();

        // Initialize the LoginPage page object with the current page
        // as the parameter.
        let loginPage;
        loginPage = new LoginPage( page );

        // Navigate to the login URL.
        await page.goto( loginPage.url );
        // Perform the login action.
        await loginPage.login( this.account.email || this.account.username, this.account.password );

        // Upon successful login, assign page as class property.
        this.page = page;
    }

    async loginAndStartNewPost() {
        const newPostButton = 'a.masterbar__item-new';
        const iframe = '.main > iframe:nth-child(1)'

        // Call the login() function to perform the login steps,
        // and to obtain the page object.
        await this.login();
        
        const page = this.page;

        console.log( 'Starting new post' );

        await page.waitForSelector( newPostButton );
        await page.click( newPostButton );
        return await page.waitForSelector( iframe );
    }
}