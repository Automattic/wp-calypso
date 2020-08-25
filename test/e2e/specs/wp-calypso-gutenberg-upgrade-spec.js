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

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();

	loginFlow = new LoginFlow( driver, 'gutenbergUpgradeUser' );
	galleryImages = times( 5, () => mediaHelper.createFile() );
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

	function testBlockIsDisplayed( blockName, isItDisplayed ) {
		assert.strictEqual(
			isItDisplayed,
			true,
			`The block "${ blockName }" was not found in the editor`
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

	async function takePreviewScreenshots( siteName ) {
		await gEditorComponent.launchPreview();
		await PostPreviewEditorComponent.switchToIFrame( driver );
		await driver.sleep( 3000 );

		const totalHeight = await driver.executeScript( 'return document.body.offsetHeight' );
		const windowHeight = await driver.executeScript( 'return window.outerHeight' );

		await takeScreenshot( `${ siteName }-preview`, totalHeight, windowHeight, ( i ) =>
			driver.executeScript( `window.scrollTo(0, window.outerHeight*${ i })` )
		);
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

			// There's the potential for simplifying the following steps further by generalizing the functions to
			// insert and check the existance of blocks on the page. This way we could potentially loop through
			// a list of blocks here and perhaps each block could be responsible for setting it up with dummy data.

			step( 'jetpack/tiled-gallery', async function () {
				// jetpack/tiled-gallery
				const tiledGallery = await gEditorComponent.insertTiledGallery();
				await tiledGallery.uploadImages( galleryImages );

				testBlockIsDisplayed(
					'jetpack/tiled-gallery',
					await gEditorComponent.tiledGalleryDisplayedInEditor()
				);
			} );

			step( 'jetpack/contact-form', async function () {
				const contactEmail = 'testing@automattic.com';
				const subject = "Let's work together";

				await gEditorComponent.insertContactForm( contactEmail, subject );

				testBlockIsDisplayed(
					'jetpack/contact-form',
					await gEditorComponent.contactFormDisplayedInEditor()
				);
			} );

			step( 'jetpack/layout-grid', async function () {
				await gEditorComponent.insertLayoutGrid();

				testBlockIsDisplayed(
					'jetpack/layout-grid',
					await gEditorComponent.layoutGridDisplayedInEditor()
				);
			} );

			step( 'core-embed/youtube', async function () {
				await gEditorComponent.insertYouTube();

				testBlockIsDisplayed(
					'core-embed/youtube',
					await gEditorComponent.youTubeDisplayedInEditor()
				);
			} );

			step( 'a8c/blog-posts', async function () {
				await gEditorComponent.insertBlogPosts();

				testBlockIsDisplayed(
					'a8c/blog-posts',
					await gEditorComponent.blogPostsDisplayedInEditor()
				);
			} );

			step( 'jetpack/subscriptions', async function () {
				await gEditorComponent.insertSubscriptions();

				testBlockIsDisplayed(
					'jetpack/subscriptions',
					await gEditorComponent.subscriptionsDisplayedInEditor()
				);
			} );

			step( 'jetpack/slideshow', async function () {
				await gEditorComponent.insertSlideshow();

				testBlockIsDisplayed(
					'jetpack/slideshow',
					await gEditorComponent.slideshowDisplayedInEditor()
				);
			} );

			step( 'jetpack/rating-star', async function () {
				await gEditorComponent.insertRatingStar();

				testBlockIsDisplayed(
					'jetpack/rating-star',
					await gEditorComponent.ratingStarDisplayedInEditor()
				);
			} );

			step( 'coblocks/dynamic-separator', async function () {
				await gEditorComponent.insertDynamicSeparator();

				testBlockIsDisplayed(
					'jetpack/rating-star',
					await gEditorComponent.dynamicSeparatorDisplayedInEditor()
				);
			} );

			step( 'coblocks/gallery-masonry', async function () {
				await gEditorComponent.insertGalleryMasonry();

				testBlockIsDisplayed(
					'coblocks/gallery-masonry',
					await gEditorComponent.galleryMasonryDisplayedInEditor()
				);
			} );

			step( 'jetpack/contact-info', async function () {
				await gEditorComponent.insertContactInfo();

				testBlockIsDisplayed(
					'coblocks/contact-info',
					await gEditorComponent.contactInfoDisplayedInEditor()
				);
			} );

			step( 'Blocks will not error in the editor', async function () {
				await gEditorComponent.ensureSaved();

				const errorShown = await gEditorComponent.errorDisplayed();
				assert.strictEqual( errorShown, false, 'There is an error shown on the editor page!' );
			} );

			step( 'Take screenshots of all the blocks in the editor', async function () {
				await takeBlockScreenshots( siteName );
			} );

			step(
				'Switch to the code editor and copy the code markup for all the blocks',
				async function () {
					currentGutenbergBlocksCode = await gEditorComponent.copyBlocksCode();
				}
			);

			step( 'Take screenshots of the whole previewed page', async function () {
				await takePreviewScreenshots( siteName );
			} );

			describe( 'Test the same blocks in the corresponding edge site', function () {
				const edgeSiteName = siteName + 'edge';
				step( 'Switches to edge site with next GB', async function () {
					// Re-use the same session created earlier but change the site
					return await loginFlow.loginAndStartNewPost( `${ edgeSiteName }.wordpress.com`, true );
				} );

				step( 'Test blocks are loaded fine from non-edge blocks markup', async function () {
					await gEditorComponent.pasteBlocksCode( currentGutenbergBlocksCode );
					await gEditorComponent.switchToBlockEditor();

					await gEditorComponent.ensureSaved();
					const errorShown = await gEditorComponent.errorDisplayed();
					assert.strictEqual( errorShown, false, 'There is an error shown on the editor page!' );
				} );

				step( 'Take screenshots of all the blocks in the editor', async function () {
					await takeBlockScreenshots( edgeSiteName );
				} );

				step( 'Take screenshots of the whole previewed page', async function () {
					await takePreviewScreenshots( edgeSiteName );
				} );
			} );
		} );
	} );
} );

after( async function () {
	await Promise.all(
		galleryImages.map( ( fileDetails ) => mediaHelper.deleteFile( fileDetails ) )
	);
} );
