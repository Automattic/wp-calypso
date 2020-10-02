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

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();

	loginFlow = new LoginFlow( driver, 'gutenbergUpgradeUser' );
	sampleImages = times( 5, () => mediaHelper.createFile() );
} );

// Should we keep the @parallel tag here for this e2e test?
describe( `[${ host }] Test popular Gutenberg blocks in edge and non-edge sites across most popular themes (${ screenSize }) @parallel`, function () {
	this.timeout( mochaTimeOut );

	async function takeScreenshot( siteName, totalHeight, viewportHeight, scrollCb ) {
		const now = Date.now() / 1000;

		const siteScreenshotsDir = join( mediaHelper.screenshotsDir, siteName );
		await fs
			.access( siteScreenshotsDir )
			.catch( () => fs.mkdir( siteScreenshotsDir, { recursive: true } ) );

		for ( let i = 0; i <= totalHeight / viewportHeight; i++ ) {
			await scrollCb( i );

			await driver.takeScreenshot().then( ( data ) => {
				return driver
					.getCurrentUrl()
					.then( ( url ) =>
						mediaHelper.writeScreenshot(
							data,
							() => join( siteName, `${ siteName }-${ i }-${ now }` ),
							{ url }
						)
					);
			} );
		}
	}

	async function assertNoErrorInEditor() {
		const errorDisplayed = await gEditorComponent.errorDisplayed();
		assert.strictEqual( errorDisplayed, false, 'There is an error shown on the editor page!' );
	}

	async function assertNoInvalidBlocksInEditor() {
		assert.strictEqual(
			await gEditorComponent.hasInvalidBlocks(),
			false,
			'There is at least one invalid block on the editor page!'
		);
	}

	async function takeBlockScreenshots( siteName ) {
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

	async function takePublishedScreenshots( siteName ) {
		await gEditorComponent.publish( { visit: true } );

		// Give blocks a chance to render and load assets before taking the screenshots
		await driver.sleep( 2000 );

		const totalHeight = await driver.executeScript( 'return document.body.offsetHeight' );
		const windowHeight = await driver.executeScript( 'return window.outerHeight' );

		await takeScreenshot( `${ siteName }-published`, totalHeight, windowHeight, ( i ) =>
			driver.executeScript( `window.scrollTo(0, window.outerHeight*${ i })` )
		);
	}

	function verifyBlocksInEditor( siteName ) {
		step( 'Blocks are displayed in the editor', async function () {
			await Promise.all(
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
				].map( async ( blockClass ) => {
					const displayed = await gEditorComponent.blockDisplayedInEditor( blockClass.blockName );
					assert.strictEqual(
						displayed,
						true,
						`The block "${ blockClass.blockName }" was not found in the editor`
					);
				} )
			);
		} );

		step( 'Blocks do not error in the editor', async function () {
			await assertNoErrorInEditor();
		} );
		// Commented-out for now because of https://github.com/Automattic/jetpack/issues/16514
		/*step( 'Blocks do not invalidate', async function () {
			await assertNoInvalidBlocksInEditor();
		} );*/

		step( 'Take screenshots of all the blocks in the editor', async function () {
			await takeBlockScreenshots( siteName );
		} );
	}

	function verifyBlocksInPublishedPage( siteName ) {
		step( 'Take screenshots of the published page', async function () {
			await takePublishedScreenshots( siteName );
		} );

		step( 'Blocks are displayed in the published page', async function () {
			await Promise.all(
				[
					BlogPostsBlockComponent,
					ContactFormBlockComponent,
					ContactInfoBlockComponent,
					DynamicSeparatorBlockComponent,
					GalleryMasonryBlockComponent,
					LayoutGridBlockComponent,
					RatingStarBlockComponent,
					SubscriptionsBlockComponent,
					TiledGalleryBlockComponent,
				].map( ( blockClass ) =>
					driverHelper.waitTillPresentAndDisplayed( driver, blockClass.blockFrontendSelector )
				)
			);
		} );
	}

	[
		'e2egbupgradehever',
		'e2egbupgradeshawburn',
		'e2egbupgrademorden',
		'e2egbupgradeexford',
		'e2egbupgrademayland',
	].forEach( ( siteName ) => {
		describe( `[${ siteName }] Can add most popular blocks to the editor without errors`, function () {
			step( `Login to ${ siteName }`, async function () {
				await loginFlow.loginAndStartNewPost( `${ siteName }.wordpress.com`, true );
				gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			} );

			// There's the potential for simplifying (reducing) the following steps further by encapsulating the configuration
			// of the block into each block's class. This way, we could just loop through a list of block classes
			// since the API would be the same.

			step( 'Insert and configure jetpack/tiled-gallery', async function () {
				const tiledGallery = await gEditorComponent.insertBlock( TiledGalleryBlockComponent );
				await tiledGallery.uploadImages( sampleImages );
			} );

			step( 'Insert and configure jetpack/contact-form', async function () {
				const contactEmail = 'testing@automattic.com';
				const subject = "Let's work together";

				// I re-used this method since it was already available
				await gEditorComponent.insertContactForm( contactEmail, subject );
			} );

			step( 'Insert and configure jetpack/layout-grid', async function () {
				await gEditorComponent.insertBlock( LayoutGridBlockComponent );
			} );

			step( 'Insert and configure core-embed/youtube', async function () {
				await gEditorComponent.insertBlock( YoutubeBlockComponent );
			} );

			step( 'Insert and configure a8c/blog-posts', async function () {
				await gEditorComponent.insertBlock( BlogPostsBlockComponent );
			} );

			step( 'Insert and configure jetpack/subscriptions', async function () {
				await gEditorComponent.insertBlock( SubscriptionsBlockComponent );
			} );

			step( 'Insert and configure jetpack/slideshow', async function () {
				await gEditorComponent.insertBlock( SlideshowBlockComponent );
			} );

			step( 'Insert and configure jetpack/rating-star', async function () {
				await gEditorComponent.insertBlock( RatingStarBlockComponent );
			} );

			step( 'Insert and configure coblocks/dynamic-separator', async function () {
				await gEditorComponent.insertBlock( DynamicSeparatorBlockComponent );
			} );

			step( 'Insert and configure coblocks/gallery-masonry', async function () {
				await gEditorComponent.insertBlock( GalleryMasonryBlockComponent );
			} );

			step( 'Insert and configure jetpack/contact-info', async function () {
				await gEditorComponent.insertBlock( ContactInfoBlockComponent );
			} );

			verifyBlocksInEditor( siteName );

			step(
				'Switch to the code editor and copy the code markup for all the blocks',
				async function () {
					currentGutenbergBlocksCode = await gEditorComponent.copyBlocksCode();
				}
			);

			verifyBlocksInPublishedPage( siteName );

			describe( 'Test the same blocks in the corresponding edge site', function () {
				const edgeSiteName = siteName + 'edge';

				step( 'Switches to edge site', async function () {
					// Re-use the same session created earlier but change the site
					await loginFlow.loginAndStartNewPost( `${ edgeSiteName }.wordpress.com`, true );

					// Loads the same blocks from the non-edge site by pasting the code markup code in the code editor
					// and then switching to the block editor
					await gEditorComponent.pasteBlocksCode( currentGutenbergBlocksCode );
					await gEditorComponent.switchToBlockEditor();
				} );

				verifyBlocksInEditor( edgeSiteName );
				verifyBlocksInPublishedPage( siteName );
			} );
		} );
	} );
} );

after( async function () {
	await Promise.all( sampleImages.map( ( fileDetails ) => mediaHelper.deleteFile( fileDetails ) ) );
} );
