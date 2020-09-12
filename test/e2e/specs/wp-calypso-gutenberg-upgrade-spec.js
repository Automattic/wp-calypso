/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';
import { times, sample } from 'lodash';
import { By } from 'selenium-webdriver';
import { promises as fs } from 'fs';
import { join } from 'path';

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
describe( `[${ host }] Test popular Gutenberg blocks in edge and non-edge sites across most popular themes (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	async function takeScreenshot( siteName, totalHeight, viewportHeight, scrollCb ) {
		const now = Date.now() / 1000;

		const siteSshotDir = join( mediaHelper.screenShotsDir(), siteName );
		await fs.access( siteSshotDir ).catch( () => fs.mkdir( siteSshotDir ) );

		for ( let i = 0; i <= totalHeight / viewportHeight; i++ ) {
			await scrollCb( i );

			await driver.takeScreenshot().then( ( data ) => {
				return driver
					.getCurrentUrl()
					.then( ( url ) =>
						mediaHelper.writeScreenshot(
							data,
							() => join( siteName, `${ siteName }-${ i }-${ now }.png` ),
							{ url }
						)
					);
			} );
		}
	}

	async function assertNoErrorInEditor() {
		assert.strictEqual(
			await gEditorComponent.errorDisplayed(),
			false,
			'There is an error shown on the editor page!'
		);
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
				].map( async ( blockClass ) =>
					assert.strictEqual(
						await gEditorComponent.blockDisplayedInEditor( blockClass.blockName ),
						true,
						`The block "${ blockClass.blockName }" was not found in the editor`
					)
				)
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
			// TODO Some blocks are commente-out because they are not being displayed on the fronted due to not being fed with sample data/assets in the editor
			// I will uncomment as I set them up.
			await Promise.all(
				[
					BlogPostsBlockComponent,
					ContactFormBlockComponent,
					// ContactInfoBlockComponent,
					DynamicSeparatorBlockComponent,
					GalleryMasonryBlockComponent,
					// LayoutGridBlockComponent,
					RatingStarBlockComponent,
					// SlideshowBlockComponent,
					SubscriptionsBlockComponent,
					TiledGalleryBlockComponent,
					YoutubeBlockComponent,
				].map( async ( blockClass ) =>
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
		describe( 'Can add most popular blocks to the editor without errors', function () {
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
				const layoutBlock = await gEditorComponent.insertBlock( LayoutGridBlockComponent );

				await layoutBlock.setupColumns( 2 );
				await layoutBlock.insertBlock( RatingStarBlockComponent, 0 );
				await layoutBlock.insertBlock( DynamicSeparatorBlockComponent, 1 );
			} );

			step( 'Insert and configure core-embed/youtube', async function () {
				const youtubeBlock = await gEditorComponent.insertBlock( YoutubeBlockComponent );
				await youtubeBlock.embed( 'https://www.youtube.com/watch?v=FhMO5QnRNvo' );
			} );

			step( 'Insert and configure a8c/blog-posts', async function () {
				await gEditorComponent.insertBlock( BlogPostsBlockComponent );
			} );

			step( 'Insert and configure jetpack/subscriptions', async function () {
				await gEditorComponent.insertBlock( SubscriptionsBlockComponent );
			} );

			step( 'Insert and configure jetpack/slideshow', async function () {
				const slideshowBlock = await gEditorComponent.insertBlock( SlideshowBlockComponent );
				await slideshowBlock.uploadImages( sampleImages );
			} );

			step( 'Insert and configure jetpack/rating-star', async function () {
				await gEditorComponent.insertBlock( RatingStarBlockComponent );
			} );

			step( 'Insert and configure coblocks/dynamic-separator', async function () {
				const dynamicSeparatorBlock = await gEditorComponent.insertBlock(
					DynamicSeparatorBlockComponent
				);
				await dynamicSeparatorBlock.resizeBy( 150 );
			} );

			step( 'Insert and configure coblocks/gallery-masonry', async function () {
				const galleryMasonryBlock = await gEditorComponent.insertBlock(
					GalleryMasonryBlockComponent
				);
				await galleryMasonryBlock.uploadImages( sampleImages );
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
