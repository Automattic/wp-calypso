/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';
import { times } from 'lodash';
import { By } from 'selenium-webdriver';
import { join } from 'path';
import { promises as fs } from 'fs';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow.js';

import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component';

import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';
import * as mediaHelper from '../lib/media-helper';
import * as driverHelper from '../lib/driver-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

import {
	GutenbergBlockComponent,
	BlogPostsBlockComponent,
	ContactFormBlockComponent,
	ContactInfoBlockComponent,
	DynamicSeparatorBlockComponent,
	GalleryMasonryBlockComponent,
	LayoutGridBlockComponent,
	RatingStarBlockComponent,
	SlideshowBlockComponent,
	SubscriptionsBlockComponent,
	TiledGalleryBlockComponent,
	YoutubeBlockComponent,
} from '../lib/gutenberg/blocks';

let driver;
let loginFlow;
let gEditorComponent;
let currentGutenbergBlocksCode;
let sampleImages;

const blockInits = new Map()
	.set( TiledGalleryBlockComponent, ( block ) => block.uploadImages( sampleImages ) )
	.set( ContactFormBlockComponent, async ( block ) => {
		await block.openEditSettings();
		await block.insertEmail( 'testing@automattic.com' );
		await block.insertSubject( "Let's work together" );
	} );

/**
 * Wrapper that provides an uniform API for creating blocks on the page. It uses
 * the `inits` dictionary defined in this module. If an entry is not found for the
 * passed `blockClass`, it fall-backs to just inserting the block on the page.
 *
 * IMPORTANT: It relies on the `gEditorComponent` having a proper instance of `GutenbergEditorComponent`,
 * so make sure to call it only when this instance is available.
 *
 * @param { typeof GutenbergBlockComponent } blockClass A block class.
 * @returns { Function } the init function to be called.
 */
async function insertBlock( blockClass ) {
	const blockInit = blockInits.get( blockClass );
	const block = await gEditorComponent.insertBlock( blockClass );

	return blockInit && blockInit( block );
}

/**
 * Take screenshot(s) of a given site's page.
 *
 * There's no way I know of to take a full-height screenshot of the page using wedriver. Because of that,
 * we basically scroll down the page in pieces and take screenshot of those areas. In the end we have multiple
 * screenshots that do represent the full page, vertically.
 *
 * @param { string } siteName the name of the WP test site (it will prepended to .wordpress.com)
 * @param { number } totalHeight The total height of the page
 * @param { number } viewportHeight The visible height
 * @param { Function } scrollCb A callback function that will be called to scroll down the page, it should accept an integer that
 * will be used in formula to calculate how much it should scroll.
 */
async function takeScreenshot( siteName, totalHeight, viewportHeight, scrollCb ) {
	const now = Date.now() / 1000;

	const siteScreenshotsDir = join( mediaHelper.screenshotsDir, siteName );
	await fs
		.access( siteScreenshotsDir )
		.catch( () => fs.mkdir( siteScreenshotsDir, { recursive: true } ) );

	for ( let i = 0; i <= totalHeight / viewportHeight; i++ ) {
		await scrollCb( i );

		const screenshotData = await driver.takeScreenshot();
		const url = await driver.getCurrentUrl();
		await mediaHelper.writeScreenshot(
			screenshotData,
			() => join( siteName, `${ siteName }-${ i }-${ now }` ),
			{ url }
		);
	}
}

/**
 * Take screenshot(s) of the editor. Useful to diagnose glitches that might manifest visually and that
 * we still don't verify automatically.
 *
 * @param { string } siteName the name of the WP test site (it will prepended to .wordpress.com)
 */
async function takeEditorScreenshots( siteName ) {
	const editorViewport = await driver.findElement(
		By.css( 'div.interface-interface-skeleton__content' )
	);

	const editorViewportScrollHeight = await driver.executeScript(
		'return arguments[0].scrollHeight',
		editorViewport
	);
	const editorViewportClientHeight = await driver.executeScript(
		'return arguments[0].clientHeight',
		editorViewport
	);

	await takeScreenshot(
		`${ siteName }-editor`,
		editorViewportScrollHeight,
		editorViewportClientHeight,
		( i ) =>
			driver.executeScript(
				`arguments[0].scroll({top: arguments[0].clientHeight*${ i }})`,
				editorViewport
			)
	);
}

/**
 * Re-usable collection of steps for verifying blocks in the editor.
 *
 * @param { typeof GutenbergBlockComponent } blockClass A block class.
 * @param { string } siteName the name of the WP test site (it will prepended to .wordpress.com)
 */
function verifyBlockInEditor( blockClass, siteName ) {
	step( 'Block is displayed in the editor', async function () {
		const displayed = await gEditorComponent.blockDisplayedInEditor( blockClass.blockName );
		assert.strictEqual(
			displayed,
			true,
			`The block "${ blockClass.blockName }" was not found in the editor`
		);
	} );

	step( 'Block does not error in the editor', async function () {
		await assertNoErrorInEditor();
	} );

	/* Commented-out for now because of https://github.com/Automattic/jetpack/issues/16514
	step( 'Blocks do not invalidate', async function () {
			await assertNoInvalidBlocksInEditor();
	} );
	*/

	step( 'Take screenshots of the block in the editor', async function () {
		await takeEditorScreenshots( siteName );
	} );
}

async function assertNoErrorInEditor() {
	const errorDisplayed = await gEditorComponent.errorDisplayed();
	assert.strictEqual( errorDisplayed, false, 'The block errored in the editor!' );
}

async function assertNoInvalidBlocksInEditor() {
	assert.strictEqual( await gEditorComponent.hasInvalidBlocks(), false, 'The block is invalid!' );
}

/**
 * Re-usable collection of steps for verifying blocks in the frontend/published page.
 *
 * @param { typeof GutenbergBlockComponent } blockClass A block class.
 * @param { string } siteName the name of the WP test site (it will prepended to .wordpress.com)
 */
function verifyBlockInPublishedPage( blockClass, siteName ) {
	step( 'Publish page', async function () {
		await gEditorComponent.publish( { visit: true } );
	} );

	step( 'Take screenshots of the published page', async function () {
		await takePublishedScreenshots( siteName );
	} );

	/**
	 * This is a temporary hack for this changeset to skip checking some blocks in the frontend until
	 * they are properly setup (which is done in subsequent PRs). Some blocks will not appear if not
	 * properly configured/filled with sample attributes or assets. This guard and comment will
	 * eventually be removed.
	 */
	if ( ! [ YoutubeBlockComponent, SlideshowBlockComponent ].includes( blockClass ) ) {
		step( 'Block is displayed in the published page', async function () {
			await driverHelper.waitTillPresentAndDisplayed( driver, blockClass.blockFrontendSelector );
		} );
	}
}

/**
 * Take screenshot(s) of the published page for given site. Useful to diagnose glitches that might manifest visually and that
 * we still don't verify automatically.
 *
 * @param { string } siteName the name of the WP test site (it will prepended to .wordpress.com)
 */
async function takePublishedScreenshots( siteName ) {
	// Give blocks a chance to render and load assets before taking the screenshots
	await driver.sleep( 2000 );

	const totalHeight = await driver.executeScript( 'return document.body.offsetHeight' );
	const windowHeight = await driver.executeScript( 'return window.outerHeight' );

	await takeScreenshot( `${ siteName }-published`, totalHeight, windowHeight, ( i ) =>
		driver.executeScript( `window.scrollTo(0, window.outerHeight*${ i })` )
	);
}

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();

	loginFlow = new LoginFlow( driver, 'gutenbergUpgradeUser' );
	sampleImages = times( 5, () => mediaHelper.createFile() );
} );

describe( `[${ host }] Test Gutenberg upgrade from non-edge to edge across most popular themes (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );
	[
		BlogPostsBlockComponent,
		ContactFormBlockComponent,
		ContactInfoBlockComponent,
		DynamicSeparatorBlockComponent,
		GalleryMasonryBlockComponent,
		LayoutGridBlockComponent,
		RatingStarBlockComponent,
		SlideshowBlockComponent,
		SubscriptionsBlockComponent,
		TiledGalleryBlockComponent,
		YoutubeBlockComponent,
	].forEach( ( blockClass ) => {
		[
			'e2egbupgradehever',
			'e2egbupgradeshawburn',
			'e2egbupgrademorden',
			'e2egbupgradeexford',
			'e2egbupgrademayland',
		].forEach( ( siteName ) => {
			describe( `Test the ${ blockClass.blockName } block on ${ siteName } @parallel`, function () {
				const edgeSiteName = siteName + 'edge';

				describe( `Test the block in the non-edge site (${ siteName })`, function () {
					step( `Login to ${ siteName }`, async function () {
						await loginFlow.loginAndStartNewPost( `${ siteName }.wordpress.com`, true );
						gEditorComponent = await GutenbergEditorComponent.Expect( driver );
					} );

					step( `Insert and configure ${ blockClass.blockName }`, async function () {
						// For some reason, after the first run, the code editor is shown by
						// default, this breaks the insertBlock call, so we force-switch to the
						// editor before the insert.
						await gEditorComponent.switchToBlockEditor();
						await insertBlock( blockClass );
					} );

					verifyBlockInEditor( blockClass, siteName );

					step(
						'Switch to the code editor and copy the code markup for the block',
						async function () {
							currentGutenbergBlocksCode = await gEditorComponent.copyBlocksCode();
						}
					);

					verifyBlockInPublishedPage( blockClass, siteName );
				} );
				describe( `Test the same block in the corresponding edge site (${ edgeSiteName })`, function () {
					step( `Switches to edge site (${ edgeSiteName })`, async function () {
						// Re-use the same session created earlier but change the site
						await loginFlow.loginAndStartNewPost( `${ edgeSiteName }.wordpress.com`, true );

						// Loads the same blocks from the non-edge site by pasting the code markup code in the code editor
						// and then switching to the block editor
						await gEditorComponent.pasteBlocksCode( currentGutenbergBlocksCode );
						await gEditorComponent.switchToBlockEditor();
					} );

					verifyBlockInEditor( blockClass, edgeSiteName );
					verifyBlockInPublishedPage( blockClass, edgeSiteName );
				} );
			} );
		} );
	} );
} );

after( async function () {
	await Promise.all( sampleImages.map( ( fileDetails ) => mediaHelper.deleteFile( fileDetails ) ) );
} );
