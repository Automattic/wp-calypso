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
    constructor( browser, accountOrFeatures) {
        this.browser = browser;

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

        const browser = this.browser;
        const context = await browser.newContext();
        const page = await context.newPage();

        // Initialize the LoginPage page object.
        let loginPage;
        loginPage = new LoginPage( page );

        // Navigate to the login URL.
        await page.goto(loginPage.url);
        return await loginPage.login( this.account.email || this.account.username, this.account.password );
    }
}