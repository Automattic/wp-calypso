/**
 * External dependencies
 */
import playwright from 'playwright';

/**
 * Internal dependencies
 */
import LoginPage from '../pages/login-page-playwright.js';

import * as dataHelper from '../data-helper';

export default class LoginFlow {
    constructor( context, accountOrFeatures ) {
        // This setup runs all tests in different (new) tabs in within the same window.
        // This can easily be changed to launch a new incognito browser window each time,
        // further isolating tests.
        this.context = context;

        // The following piece is a simplified one from the original LoginFlow file.
        const legacyConfig = dataHelper.getAccountConfig(accountOrFeatures);
        if (!legacyConfig) {
            throw new Error(`Account key '${accountOrFeatures}' not found in the configuration`);
        }

        this.account = {
            email: legacyConfig[0],
            username: legacyConfig[0],
            password: legacyConfig[1],
            loginURL: legacyConfig[2],
            legacyAccountName: accountOrFeatures,
        };
    }   

    async login() {
        /* This will be the base method that performs the logins.
        Functions that perform additional actions on top of logging in
        such as new post, new page, select people, etc. will call this method
        as the first call. */

        console.log( 'Logging in as ' + this.account.username );

        // Retrieve the browser context stored in this object.
        const context = this.context;
        // Launch a new page/tab in the context.
        const page = await context.newPage();

        // Initialize the LoginPage page object with the current (empty) page.
        let loginPage;
        loginPage = new LoginPage( page );

        // Navigate to the login URL.
        await page.goto( loginPage.url );
        // Perform the login action.
        await loginPage.login( this.account.email || this.account.username, this.account.password );

        // Upon successful login, assign page as class property.
        // this.page = page;
        return await page;
    }

    async loginAndStartNewPost() {
        const newPostButton = 'a.masterbar__item-new';
        const iframe = '.main > iframe:nth-child(1)';

        // Call the login() function to perform the login steps and to obtain the page object.
        let page = await this.login();
        
        console.log( 'Starting new post' );

        await page.waitForSelector( newPostButton );
        await page.click( newPostButton );
        // Editor is loaded once the iframe shows.
        await page.waitForSelector( iframe );
        // Return the page object to the caller for further operations.
        return page;
    }

    async loginAndSelectMySites() {
        const navBarSelector = '.masterbar';
        const mySitesSelector = 'header.masterbar a.masterbar__item';

        let page = await this.login();

        console.log( 'Selecting My Sites' );

        await page.waitForSelector( navBarSelector );
        await page.waitForSelector( mySitesSelector );
        
        page.waitForNavigation();
        await page.click(mySitesSelector);
        // Return page once navigation is complete.

        return page;
    }
}