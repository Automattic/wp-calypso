/**
 * External dependencies
 */
import playwright from 'playwright';
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow-playwright.js';

import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component-playwright.js';

import * as driverManager from '../lib/driver-manager';
import * as mediaHelper from '../lib/media-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const gutenbergUser = 'gutenbergSimpleSiteUser';

// The intention here is to launch exactly one instance of the browser
// and context. Playwright launches browsers in incognito mode to ensure a clean context (session).
let browser, context;

before( async function() {
    browser = await playwright.chromium.launch({headless: false, devtools: false });
    context = await browser.newContext();
});

describe( `Calypso Gutenberg Editor: CoBlocks (${ screenSize })`, function () {
    this.timeout( mochaTimeOut );

    describe( `Insert a Click to Tweet block`, function () {
        let page;

        it( `Can log in and start a new post`, async function() {
            this.LoginFlow = new LoginFlow( context, gutenbergUser );
            page = await this.LoginFlow.loginAndStartNewPost();
            // Initialize an instance of GutenbergEditorComponent with reference to the current page.
            this.GutenbergEditorComponent = new GutenbergEditorComponent( page );
            // Fulfills a similar role to the GutenbergEditorComponent.Expect() call of the in-repo file.
            await this.GutenbergEditorComponent._init(); 
        });
    
        it( `Can insert the Click to Tweet block`, async function() {
            const editor = await this.GutenbergEditorComponent;
            const blockName = 'Click to Tweet';
            
            await editor.openBlockInserter();
            await editor.searchBlock( blockName );
            return await editor.addBlock( blockName );    
        });
    
        it( `Can enter text to tweet`, async function () {
            const editor = await this.GutenbergEditorComponent;
            const blockSelector = '.wp-block-coblocks-click-to-tweet__text';
            const tweetContent = 'The foolish man seeks happiness in the distance. The wise grows it under his feet. — James Oppenheim';
    
            return await editor.fillText( blockSelector, tweetContent );
        });
    
        it( `Can publish and view content`, async function () {
            const editor = this.GutenbergEditorComponent;
    
            await editor.saveDraft();
            await editor.publishPost();
            await editor.confirmPostPublished();
            return await editor.visitPublishedPost();
        });
    
        it( `Can see the Click to Tweet block in our published post`, async function () {
            const clickToTweetBlock = '.entry-content .wp-block-coblocks-click-to-tweet';
    
            return await page.waitForSelector( clickToTweetBlock );
        });
    })

    describe( `Insert a Dynamic HR block`, function () {
        let page;

        it( `Can log in and start a new post`, async function() {
            this.LoginFlow = new LoginFlow(context, gutenbergUser);
            page = await this.LoginFlow.loginAndStartNewPost();
            this.GutenbergEditorComponent = new GutenbergEditorComponent(page);
            await this.GutenbergEditorComponent._init();
        });

        it( `Can insert the Dynamic HR block`, async function () {
            const editor = this.GutenbergEditorComponent;
            const blockName = 'Dynamic HR';

            await editor.openBlockInserter();
            await editor.searchBlock( blockName );
            return await editor.addBlock( blockName );
        });

        it( `Can publish and view content`, async function () {
            const editor = this.GutenbergEditorComponent;
    
            await editor.publishPost();
            await editor.confirmPostPublished();
            return await editor.visitPublishedPost();
        });

        it( `Can see the Dynamic HR block in our published post`, async function () {
            const dynamicHRBlock = '.entry-content .wp-block-coblocks-dynamic-separator';
    
            return await page.waitForSelector( dynamicHRBlock );
        });
    })

    describe( `Insert a Hero block`, function() {
        let page;

        it( `Can log in and start a new post`, async function() {
            this.LoginFlow = new LoginFlow(context, gutenbergUser);
            page = await this.LoginFlow.loginAndStartNewPost();
            this.GutenbergEditorComponent = new GutenbergEditorComponent(page);
            await this.GutenbergEditorComponent._init();
        });

        it( `Can insert the Hero block`, async function () {
            const editor = this.GutenbergEditorComponent;
            const blockName = 'Hero';

            await editor.openBlockInserter();
            await editor.searchBlock( blockName );
            return await editor.addBlock( blockName );
        });

        it( `Can publish and view content`, async function () {
            const editor = this.GutenbergEditorComponent;
    
            await editor.publishPost();
            await editor.confirmPostPublished();
            return await editor.visitPublishedPost();
        });

        it( `Can see the Hero block in our published post`, async function () {
            const heroBlock = '.entry-content .wp-block-coblocks-hero';
    
            return await page.waitForSelector( heroBlock );
        });
    })

    describe( `Insert a Logos block`, function() {
        let page;
        let fileDetails;

        // Create image file for upload
		before( async function () {
			fileDetails = mediaHelper.createFile();
			return fileDetails;
		});

        it( `Can log in and start a new post`, async function() {
            this.LoginFlow = new LoginFlow(context, gutenbergUser);
            page = await this.LoginFlow.loginAndStartNewPost();
            // Initialize an instance of GutenbergEditorComponent with reference to the current page.
            this.GutenbergEditorComponent = new GutenbergEditorComponent(page);
            // Fulfills a similar role to the GutenbergEditorComponent.Expect() call of the in-repo file.
            await this.GutenbergEditorComponent._init();
        });

        it( `Can insert the Logos block`, async function () {
            const editor = this.GutenbergEditorComponent;
            const blockName = 'Logos';

            await editor.openBlockInserter();
            await editor.searchBlock( blockName );
            return await editor.addBlock( blockName );
        });

        it( `Can select an image as a logo`, async function () {
            const editor = this.GutenbergEditorComponent;
            const fileInputSelector = '.components-form-file-upload input[type="file"]';
            
            return await editor.uploadFile( '.block-editor-media-placeholder', fileInputSelector, fileDetails.file );
        });

        it( `Can publish and view content`, async function () {
            const editor = this.GutenbergEditorComponent;
    
            await editor.publishPost();
            await editor.confirmPostPublished();
            return await editor.visitPublishedPost();
        });

        it( `Can see the Logo block in our published post`, async function () {
            const logosBlock = '.entry-content .wp-block-coblocks-logos';
    
            return await page.waitForSelector( logosBlock );
        });
    })

    describe( `Insert a Pricing Table block`, async function() {
        let page;

        it( `Can log in and start a new post` , async function () {
            this.LoginFlow = new LoginFlow(context, gutenbergUser);
            page = await this.LoginFlow.loginAndStartNewPost();
            this.GutenbergEditorComponent = new GutenbergEditorComponent(page);
            await this.GutenbergEditorComponent._init();
        });

        it( `Can insert the Pricing Table block`, async function () {
            const editor = this.GutenbergEditorComponent;
            const blockName = 'Pricing Table';

            await editor.openBlockInserter();
            await editor.searchBlock( blockName );
            return await editor.addBlock( blockName );
        });

        it( `Can publish and view content`, async function () {
            const editor = this.GutenbergEditorComponent;

            await editor.publishPost();
            await editor.confirmPostPublished();
            return await editor.visitPublishedPost();
        });

        it( `Can see the Pricing Table block in our published post`, async function () {
            const pricingTableBlock = '.entry-content .wp-block-coblocks-pricing-table';

            return await page.waitForSelector( pricingTableBlock );
        });
    })
})

after( async function() {
    await browser.close();
});