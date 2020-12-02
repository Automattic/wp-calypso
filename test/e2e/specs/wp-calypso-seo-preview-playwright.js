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

let browser;

before( async function () {
    browser = await playwright.chromium.launch({ headless: false, devtools: true });
});

describe( `[${ host }] SEO Preview page: (${ screenSize })`, function () {
    this.timeout( mochaTimeOut );

    // Login as Business plan user and open the sidebar
    describe( `SEO Preview page:`, function () {
        it( `Can log in`, async function () {
            this.LoginFlow = new LoginFlow( browser, 'wooCommerceUser' );
            await this.LoginFlow.loginAndSelectMySites();
            this.sidebarComponent = new SidebarComponent( this.LoginFlow.page );
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
            const page = this.LoginFlow.page;

            await page.waitForSelector( trafficTabSelector );
            await page.click( trafficTabSelector );
            await page.waitForSelector( frontPageMetaDescriptionSelector );
            await page.fill( frontPageMetaDescriptionSelector, 'test text' );
            return await page.click( frontPageMetaDescriptionPreviewButton );
        });

        it( `Ensure site preview stays open for 10 seconds`, async function () {
            const seoPreview = '.web-preview.is-seo';
            const page = this.LoginFlow.page;
            
            await page.waitForSelector( seoPreview );
            await page.waitForTimeout( 10000 );

            assert( await page.$$( seoPreview ).length > 0, 'The site preview component has been closed.');
        });
    })
});

after( async function () {
    await browser.close();
});