/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';
import playwright from 'playwright';

/**
 * Internal dependencies
 */
import * as dataHelper from '../lib/data-helper';
import * as driverManager from '../lib/driver-manager';

import LoginFlow from '../lib/flows/login-flow-playwright.js';

import SidebarComponent from '../lib/components/sidebar-component-playwright.js';

const mochaTimeOut = config.get('mochaTimeoutMS');
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let browser, context;

before(async function () {
    browser = await playwright.chromium.launch({ headless: false, devtools: false });
    context = await browser.newContext();
});

describe( `[${ host }] SEO Preview page: (${ screenSize })`, function () {
    this.timeout( mochaTimeOut );

    // Login as Business plan user and open the sidebar
    describe( `SEO Preview page:`, function () {
        let page;

        it( `Can log in`, async function () {
            this.LoginFlow = new LoginFlow( context, 'wooCommerceUser' );
            page = await this.LoginFlow.loginAndSelectMySites();
            this.sidebarComponent = new SidebarComponent( page );
            return await this.sidebarComponent._init();
        });

        it( `Open the marketing page`, async function () {
            return await this.sidebarComponent.selectMarketing();
        });

        it( `Enter front page meta description and click preview button`, async function () {
            // In a production system, these should have its own page object, like the current in-repo
            // tests do.
            const trafficTabSelector = '.section-nav-tab__link[href*="/marketing/traffic/"]';
            const frontPageMetaDescriptionSelector = '#advanced_seo_front_page_description';
            const frontPageMetaDescriptionPreviewButton = '.seo-settings__preview-button';

            await page.waitForSelector( trafficTabSelector );
            await page.click( trafficTabSelector );
            await page.waitForSelector( frontPageMetaDescriptionSelector );
            await page.fill( frontPageMetaDescriptionSelector, 'test text' );
            return await page.click( frontPageMetaDescriptionPreviewButton );
        });

        it( `Ensure site preview stays open for 10 seconds`, async function () {
            const seoPreview = '.web-preview.is-seo';
            
            await page.waitForSelector( seoPreview );
            await page.waitForTimeout( 10000 );

            // To test this, try closing the preview manually. It will fail the assertion.
            let previewIsOpen = await page.$$( seoPreview );
            assert( previewIsOpen.length > 0, 'The site preview component has been closed.');
        });
    })
});

after( async function () {
    await browser.close();
});