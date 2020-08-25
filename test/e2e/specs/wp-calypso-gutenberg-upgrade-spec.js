/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';
import { times } from 'lodash';
import { By } from 'selenium-webdriver';
import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow.js';

import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component';
import PostPreviewEditorComponent from '../lib/components/post-preview-component';

import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';
import * as mediaHelper from '../lib/media-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;
let loginFlow;
let gEditorComponent;
let currentGutenbergBlocksCode;
let galleryImages;

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

before( async function () {
	console.log( 'BEFORE CALLED!' );
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();

	loginFlow = new LoginFlow( driver, 'gutenbergUpgradeUser' );
	galleryImages = times( 5, () => mediaHelper.createFile() );
} );

describe( `[${ host }] Test popular Gutenberg blocks in edge and non-edge sites across most popular themes (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

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

			step( 'jetpack/tiled-gallery', async function () {
				// jetpack/tiled-gallery
				const tiledGallery = await gEditorComponent.insertTiledGallery();
				await tiledGallery.uploadImages( galleryImages );

				const tiledGalleryDisplayedInEditor = await gEditorComponent.tiledGalleryDisplayedInEditor();
				assert.strictEqual(
					tiledGalleryDisplayedInEditor,
					true,
					'The tiled gallery block is not displayed in the editor'
				);
			} );

			step( 'jetpack/contact-form', async function () {
				const contactEmail = 'testing@automattic.com';
				const subject = "Let's work together";

				await gEditorComponent.insertContactForm( contactEmail, subject );

				const contactFormDisplayedInEditor = await gEditorComponent.contactFormDisplayedInEditor();
				assert.strictEqual(
					contactFormDisplayedInEditor,
					true,
					'The contact form is not displayed in the editor'
				);
			} );

			step( 'jetpack/layout-grid', async function () {
				await gEditorComponent.insertLayoutGrid();
				const layoutGridDisplayedInEditor = await gEditorComponent.layoutGridDisplayedInEditor();
				assert.strictEqual(
					layoutGridDisplayedInEditor,
					true,
					'The layout grid is not displayed in the editor'
				);
			} );

			step( 'core-embed/youtube', async function () {
				await gEditorComponent.insertYouTube();
				const youTubeDisplayedInEditor = await gEditorComponent.youTubeDisplayedInEditor();
				assert.strictEqual(
					youTubeDisplayedInEditor,
					true,
					'The youtube embed is not displayed in the editor'
				);
			} );

			step( 'a8c/blog-posts', async function () {
				await gEditorComponent.insertBlogPosts();
				const blogPostsDisplayedInEditor = await gEditorComponent.blogPostsDisplayedInEditor();
				assert.strictEqual(
					blogPostsDisplayedInEditor,
					true,
					'The blog posts block is not displayed in the editor'
				);
			} );

			step( 'jetpack/subscriptions', async function () {
				await gEditorComponent.insertSubscriptions();
				const subscriptionsDisplayedInEditor = await gEditorComponent.subscriptionsDisplayedInEditor();
				assert.strictEqual(
					subscriptionsDisplayedInEditor,
					true,
					'The subscriptions block is not displayed in the editor'
				);
			} );

			step( 'jetpack/slideshow', async function () {
				await gEditorComponent.insertSlideshow();
				const slideshowDisplayedInEditor = await gEditorComponent.slideshowDisplayedInEditor();
				assert.strictEqual(
					slideshowDisplayedInEditor,
					true,
					'The slideshow block is not displayed in the editor'
				);
			} );

			step( 'jetpack/rating-star', async function () {
				await gEditorComponent.insertRatingStar();
				const ratingStarDisplayedInEditor = await gEditorComponent.ratingStarDisplayedInEditor();
				assert.strictEqual(
					ratingStarDisplayedInEditor,
					true,
					'The rating star block is not displayed in the editor'
				);
			} );

			step( 'coblocks/dynamic-separator', async function () {
				await gEditorComponent.insertDynamicSeparator();
				const dynamicSeparatorDisplayedInEditor = await gEditorComponent.dynamicSeparatorDisplayedInEditor();
				assert.strictEqual(
					dynamicSeparatorDisplayedInEditor,
					true,
					'The dynamic separator block is not displayed in the editor'
				);
			} );

			step( 'coblocks/gallery-masonry', async function () {
				await gEditorComponent.insertGalleryMasonry();
				const galleryMasonryDisplayedInEditor = await gEditorComponent.galleryMasonryDisplayedInEditor();
				assert.strictEqual(
					galleryMasonryDisplayedInEditor,
					true,
					'The gallery masonry block is not displayed in the editor'
				);
			} );

			step( 'jetpack/contact-info', async function () {
				await gEditorComponent.insertContactInfo();
				const contactInfoDisplayedInEditor = await gEditorComponent.contactInfoDisplayedInEditor();
				assert.strictEqual(
					contactInfoDisplayedInEditor,
					true,
					'The contact info block is not displayed in the editor'
				);
			} );

			step( 'Blocks will not error in the editor', async function () {
				await gEditorComponent.ensureSaved();

				const errorShown = await gEditorComponent.errorDisplayed();
				assert.strictEqual( errorShown, false, 'There is an error shown on the editor page!' );
			} );

			step( 'Will take screenshots of all the blocks in the editor', async function () {
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
			} );

			step(
				'Will switch to the code editor and copy the code markup for all the blocks',
				async function () {
					currentGutenbergBlocksCode = await gEditorComponent.copyBlocksCode();
				}
			);

			step( 'Will take a screenhot of all the blocks in the editor', async function () {
				await gEditorComponent.launchPreview();
				await PostPreviewEditorComponent.switchToIFrame( driver );
				await driver.sleep( 3000 );

				const totalHeight = await driver.executeScript( 'return document.body.offsetHeight' );
				const windowHeight = await driver.executeScript( 'return window.outerHeight' );

				await takeScreenshot( `${ siteName }-preview`, totalHeight, windowHeight, ( i ) =>
					driver.executeScript( `window.scrollTo(0, window.outerHeight*${ i })` )
				);
			} );

			step( 'Switches to edge site with next GB', async function () {
				// Re-use the same session created earlier but change the site
				return await loginFlow.loginAndStartNewPost( `${ siteName }edge.wordpress.com`, true );
			} );

			step( 'Test blocks are loaded fine from non-edge blocks markup', async function () {
				await gEditorComponent.pasteBlocksCode( currentGutenbergBlocksCode );
				await gEditorComponent.switchToBlockEditor();

				await gEditorComponent.ensureSaved();
				const errorShown = await gEditorComponent.errorDisplayed();
				assert.strictEqual( errorShown, false, 'There is an error shown on the editor page!' );
			} );
		} );

		after( async function () {
			await Promise.all(
				galleryImages.map( ( fileDetails ) => mediaHelper.deleteFile( fileDetails ) )
			);
		} );
	} );
} );
