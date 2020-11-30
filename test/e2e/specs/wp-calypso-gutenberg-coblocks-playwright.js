/**
 * External dependencies
 */

import playwright from 'playwright';
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow-playwright.js';

import * as driverManager from '../lib/driver-manager';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const gutenbergUser =
    process.env.COBLOCKS_EDGE === 'true' ? 'coBlocksSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';

describe( `Calypso Gutenberg Editor: CoBlocks (${ screenSize })`, function () {
    this.timeout( mochaTimeOut );

    let browser;

    before( async function() {
        browser = await playwright.chromium.launch({headless: false});
    });

    it( `Can log in`, async function() {
        this.LoginFlow = new LoginFlow( browser, gutenbergUser );
        return await this.LoginFlow.login();
    });

    it( `Can insert the Click to Tweet block`, async function() {
        // steps    
    })

    after( async function() {
        await browser.close()
    })

})