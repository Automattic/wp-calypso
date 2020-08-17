/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';
import { times } from 'lodash';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow.js';

import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component';

import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';
import * as mediaHelper from '../lib/media-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;
let currentGutenbergBlocksCode;
let galleryImages;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
	this.loginFlow = new LoginFlow( driver, 'gutenbergUpgradeUser' );
	galleryImages = times( 5, () => mediaHelper.createFile() );
} );

describe( `[${ host }] Calypso Gutenberg Editor: Pages (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	// I'm still not sure about the structure and description here, will review it soon
	describe( 'Smoke test popular blocks: @parallel', function () {
		[
			'e2egbupgradehever',
			'e2egbupgradeshawburn',
			'e2egbupgrademorden',
			'e2egbupgradeexford',
			'e2egbupgrademayland',
		].forEach( ( siteName ) => {
			step( `Test popular blocks in ${ siteName }`, async function () {
				return await this.loginFlow.loginAndStartNewPost( `${ siteName }.wordpress.com`, true );
			} );

			step( 'Popular blocks can be inserted and are shown without errors', async function () {
				const contactEmail = 'testing@automattic.com';
				const subject = "Let's work together";

				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );

				// jetpack/tiled-gallery
				const tiledGallery = await gEditorComponent.insertTiledGallery();
				await tiledGallery.uploadImages( galleryImages );
				// TODO When passing the block markup to the edge site, it might worth verifying if the images have loaded... (how?)
				// FWIW, I can verify by looking that the images do load across sites even if the gallery was setup in a different wpcom site.
				const tiledGalleryDisplayedInEditor = await gEditorComponent.tiledGalleryDisplayedInEditor();
				assert.strictEqual(
					tiledGalleryDisplayedInEditor,
					true,
					'The tiled gallery block is not displayed in the editor'
				);

				// jetpack/contact-form
				await gEditorComponent.insertContactForm( contactEmail, subject );

				const contactFormDisplayedInEditor = await gEditorComponent.contactFormDisplayedInEditor();
				assert.strictEqual(
					contactFormDisplayedInEditor,
					true,
					'The contact form is not displayed in the editor'
				);

				// jetpack/layout-grid
				await gEditorComponent.insertLayoutGrid();
				const layoutGridDisplayedInEditor = await gEditorComponent.layoutGridDisplayedInEditor();
				assert.strictEqual(
					layoutGridDisplayedInEditor,
					true,
					'The layout grid is not displayed in the editor'
				);
				// TODO Set it up with sample data (innerBlocks here)

				// core-embed/youtube
				await gEditorComponent.insertYouTube();
				// TODO Set it up with sample data
				const youTubeDisplayedInEditor = await gEditorComponent.youTubeDisplayedInEditor();
				assert.strictEqual(
					youTubeDisplayedInEditor,
					true,
					'The youtube embed is not displayed in the editor'
				);

				// a8c/blog-posts
				await gEditorComponent.insertBlogPosts();
				// TODO Set it up with sample data
				const blogPostsDisplayedInEditor = await gEditorComponent.blogPostsDisplayedInEditor();
				assert.strictEqual(
					blogPostsDisplayedInEditor,
					true,
					'The blog posts block is not displayed in the editor'
				);

				// jetpack/subscriptions
				await gEditorComponent.insertSubscriptions();
				// TODO Set it up with sample data
				const subscriptionsDisplayedInEditor = await gEditorComponent.subscriptionsDisplayedInEditor();
				assert.strictEqual(
					subscriptionsDisplayedInEditor,
					true,
					'The subscriptions block is not displayed in the editor'
				);

				// jetpack/slideshow
				await gEditorComponent.insertSlideshow();
				// TODO Set it up with sample data
				const slideshowDisplayedInEditor = await gEditorComponent.slideshowDisplayedInEditor();
				assert.strictEqual(
					slideshowDisplayedInEditor,
					true,
					'The slideshow block is not displayed in the editor'
				);

				// jetpack/rating-star
				await gEditorComponent.insertRatingStar();
				// TODO Set it up with sample data
				const ratingStarDisplayedInEditor = await gEditorComponent.ratingStarDisplayedInEditor();
				assert.strictEqual(
					ratingStarDisplayedInEditor,
					true,
					'The rating star block is not displayed in the editor'
				);

				// coblocks/dynamic-separator
				await gEditorComponent.insertDynamicSeparator();
				// TODO Set it up with sample data
				const dynamicSeparatorDisplayedInEditor = await gEditorComponent.dynamicSeparatorDisplayedInEditor();
				assert.strictEqual(
					dynamicSeparatorDisplayedInEditor,
					true,
					'The dynamic separator block is not displayed in the editor'
				);

				// coblocks/gallery-masonry
				await gEditorComponent.insertGalleryMasonry();
				// TODO Set it up with sample data
				const galleryMasonryDisplayedInEditor = await gEditorComponent.galleryMasonryDisplayedInEditor();
				assert.strictEqual(
					galleryMasonryDisplayedInEditor,
					true,
					'The gallery masonry block is not displayed in the editor'
				);

				// jetpack/contact-info
				// This is added last for now because it steals the focus of the inserter and any blocks added after it are considered innerBlocks of it
				// I guess giving the editor focus again would be easy but it was easier to move it as the last-added block
				await gEditorComponent.insertContactInfo();
				// TODO Set it up with sample data
				const contactInfoDisplayedInEditor = await gEditorComponent.contactInfoDisplayedInEditor();
				assert.strictEqual(
					contactInfoDisplayedInEditor,
					true,
					'The contact info block is not displayed in the editor'
				);

				await gEditorComponent.ensureSaved();
				const errorShown = await gEditorComponent.errorDisplayed();
				assert.strictEqual( errorShown, false, 'There is an error shown on the editor page!' );

				// IMPORTANT: Need to switch to the right iframe before selecting...
				// TODO Refactor this into its own test component so that the iframe switching code is abstracted away (maybe reuse the Gutenberg component -- since it's part of it)
				currentGutenbergBlocksCode = await gEditorComponent.copyBlocksCode();
			} );

			step( 'Switches to edge site with next GB', async function () {
				// Reuse the same session created earlier but change the site
				return await this.loginFlow.loginAndStartNewPost( `${ siteName }edge.wordpress.com`, true );
			} );

			step( 'Test blocks markup are loaded fine from edge', async function () {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.pasteBlocksCode( currentGutenbergBlocksCode );
				await gEditorComponent.switchToBlockEditor();

				await gEditorComponent.ensureSaved();
				const errorShown = await gEditorComponent.errorDisplayed();
				assert.strictEqual( errorShown, false, 'There is an error shown on the editor page!' );
			} );
		} );
	} );

	after( async function () {
		await Promise.all(
			galleryImages.map( ( fileDetails ) => mediaHelper.deleteFile( fileDetails ) )
		);
	} );
} );
