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
        browser = await playwright.chromium.launch({headless: false, devtools: true });
    });

    it( `Can log in`, async function() {
        this.LoginFlow = new LoginFlow( browser, gutenbergUser );
        return await this.LoginFlow.loginAndStartNewPost();
    });

    it( `Can insert the Click to Tweet block`, async function() {
        // The block editor is within an iframe and puppeteer/playwright cannot see such elements
        // without selecting the iframe.
        const iframe = '.main > iframe:nth-child(1)'
        const toggleBlockInserter = '.edit-post-header .edit-post-header-toolbar__inserter-toggle';
        const inserterBlockSearch = 'input.block-editor-inserter__search-input';
        const insertClickToTweetButton = '.edit-post-layout__inserter-panel .block-editor-inserter__block-list button.editor-block-list-item-coblocks-click-to-tweet';
        const clickToTweetBlock = '.wp-block-coblocks-click-to-tweet';

        // Retrieve the page object.
        const page = await this.LoginFlow.page;
        await page.waitForSelector( iframe );

        // Obtain the main block editor window iframe.
        const handle = await page.$( iframe );
        const frame = await handle.contentFrame();

        // From this point on, interact with the frame.
        await frame.waitForSelector( toggleBlockInserter );
        await frame.click( toggleBlockInserter );
        await frame.waitForSelector( inserterBlockSearch );
        await frame.focus( inserterBlockSearch );
        await frame.fill( inserterBlockSearch, 'Click to tweet' );
        await frame.waitForSelector( insertClickToTweetButton );
        await frame.click( insertClickToTweetButton );

        return await frame.waitForSelector( clickToTweetBlock );
    });

    it( `Can enter text to tweet`, async function () {
        const iframe = '.main > iframe:nth-child(1)'
        const clickToTweetTextInput = '.wp-block-coblocks-click-to-tweet__text';
        const tweetContent = 'The foolish man seeks happiness in the distance. The wise grows it under his feet. — James Oppenheim';
        
        const page = await this.LoginFlow.page;
        const handle = await page.$( iframe );
        const frame = await handle.contentFrame();

        await frame.waitForSelector( clickToTweetTextInput );
        await frame.focus( clickToTweetTextInput );
        return await frame.fill( clickToTweetTextInput, tweetContent);
    });

    it( `Can publish and view content`, async function () {
        const iframe = '.main > iframe:nth-child(1)'
        const saveDraftButton = '.editor-post-save-draft';
        const savedSelector = 'span.is-saved';
        const snackBarNotice = '.components-snackbar';
        const snackBarNoticeLinkSelector = '.components-snackbar__content a';
        const prePublishButtonSelector = '.editor-post-publish-panel__toggle';
        const publishSelector = '.editor-post-publish-panel__header-publish-button button.editor-post-publish-button';
        const viewPublishedPostButton = 'text="View Post"';

        const page = await this.LoginFlow.page;
        const handle = await page.$( iframe );
        const frame = await handle.contentFrame();

        // Save as draft.
        await frame.waitForSelector( saveDraftButton );
        await frame.click( saveDraftButton );
        await frame.waitForSelector( savedSelector );

        // Publish post.
        await frame.waitForSelector( prePublishButtonSelector );
        await frame.click( prePublishButtonSelector );

        // Choose to publish post.
        await frame.waitForSelector( publishSelector );
        await frame.click( publishSelector );

        // Look for snackbar/toast that appears on successful publishing.
        // Visit the site from that link.
        // const editorURL = await page.url();
        await frame.waitForSelector( snackBarNotice );
        page.waitForNavigation();
        return await frame.click( snackBarNoticeLinkSelector );

        // const publishedURL = await page.url();

        // Wait for the site-content div to load.
        // return await page.waitForSelector( 'site-content' );
    });

    it( `Can see the Click to Tweet block in our published post`, async function () {
        const clickToTweetBlock = '.entry-content .wp-block-coblocks-click-to-tweet';

        const page = this.LoginFlow.page;

        return await page.waitForSelector( clickToTweetBlock );
    });

    after( async function() {
        await browser.close();
    })

})