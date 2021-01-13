/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';
import { times } from 'lodash';

/**
 * Internal dependencies
 */
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';
import * as mediaHelper from '../lib/media-helper';
import * as driverHelper from '../lib/driver-helper';
import LoginFlow from '../lib/flows/login-flow.js';
import ReaderPage from '../lib/pages/reader-page';
import NavBarComponent from '../lib/components/nav-bar-component.js';
import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component';
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
	PremiumContentBlockComponent,
} from '../lib/gutenberg/blocks';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;
let editor;
let sampleImages;

const blockInits = new Map()
	.set( TiledGalleryBlockComponent, async ( block ) => {
		await block.uploadImages( sampleImages );
	} )
	.set( ContactFormBlockComponent, async ( block ) => {
		await block.openEditSettings();
		await block.insertEmail( 'testing@automattic.com' );
		await block.insertSubject( "Let's work together" );
	} )
	.set( LayoutGridBlockComponent, async ( block ) => {
		await block.setupColumns( 2 );
		await block.insertBlock( RatingStarBlockComponent );
		await block.insertBlock( DynamicSeparatorBlockComponent );
	} )
	.set( ContactInfoBlockComponent, async ( block ) => {
		await block.fillUp( {
			email: 'awesome@possum.ttt',
			phoneNumber: '555-234-4323',
			streetAddress: 'E2E street',
			addressLine2: 'underground bunker 2',
			addressLine3: '#1111',
			city: 'GutenPolis',
			state: 'Gutenfolia',
			zipCode: '1337',
			country: 'United Gutenberg States of Calypsoland',
			linkToGmaps: true,
		} );
	} )
	.set( YoutubeBlockComponent, async ( block ) => {
		await block.embed( 'https://www.youtube.com/watch?v=FhMO5QnRNvo' );
	} )
	.set( DynamicSeparatorBlockComponent, async ( block ) => {
		await block.resizeBy( 150 );
	} )
	.set( SlideshowBlockComponent, async ( block ) => {
		await block.uploadImages( sampleImages );
	} )
	.set( GalleryMasonryBlockComponent, async ( block ) => {
		await block.uploadImages( sampleImages );
	} );

/**
 * Wrapper that provides an uniform API for creating blocks on the page. It uses
 * the `inits` dictionary defined in this module. If an entry is not found for
 * the passed `Block`, it fall-backs to just inserting the block on the page.
 *
 * @param {Function} Block A block class.
 */
async function insertBlock( Block ) {
	const block = await editor.insertBlock( Block );
	const blockInit = blockInits.get( Block );

	if ( blockInit ) {
		await blockInit( block );
	}
}

/**
 * Starts a new post in the editor. User must be logged-in.
 *
 * @param {object} loginFlow Instance of the LoginFlow helper.
 * @returns {object} Instance of the GutenbergEditorComponent.
 */
async function startNewPost( loginFlow ) {
	await ReaderPage.Visit( driver );
	await NavBarComponent.Expect( driver );

	const navbarComponent = await NavBarComponent.Expect( driver );
	await navbarComponent.clickCreateNewPost( { siteURL: loginFlow.account.loginURL } );

	const gutenbergEditorComponent = await GutenbergEditorComponent.Expect( driver );
	await gutenbergEditorComponent.initEditor();

	return gutenbergEditorComponent;
}

/**
 * Re-usable collection of steps for verifying blocks in the editor.
 *
 * @param {Function} Block A block class.
 */
function verifyBlockInEditor( Block ) {
	step( 'Block is displayed in the editor', async function () {
		const blockDisplayed = await editor.blockDisplayedInEditor( Block.blockName );
		assert( blockDisplayed, `The block "${ Block.blockName }" was not found in the editor.` );
	} );

	step( 'Block does not error in the editor', async function () {
		const errorDisplayed = await editor.errorDisplayed();
		assert( ! errorDisplayed, `The block "${ Block.blockName }" errored in the editor.` );
	} );

	step( 'Block does not invalidate', async function () {
		const hasInvalidBlocks = await editor.hasInvalidBlocks();
		assert( ! hasInvalidBlocks, `The block "${ Block.blockName }" is invalid.` );
	} );
}

/**
 * Re-usable collection of steps for verifying blocks in the frontend/published page.
 *
 * @param {Function} Block A block class.
 */
function verifyBlockInPublishedPage( Block ) {
	step( 'Publish page', async function () {
		await editor.publish( { visit: true } );
	} );

	/**
	 * This is a temporary hack for this changeset to skip checking some blocks in
	 * the frontend until they are properly setup (which is done in subsequent
	 * PRs). Some blocks will not appear if not properly configured/filled with
	 * sample attributes or assets. This guard and comment will eventually be
	 * removed.
	 */
	if ( ! [ YoutubeBlockComponent, SlideshowBlockComponent ].includes( Block ) ) {
		step( 'Block is displayed in the published page', async function () {
			await driverHelper.waitTillPresentAndDisplayed( driver, Block.blockFrontendSelector );
		} );
	}
}

describe( `[${ host }, ${ screenSize }] Test Gutenberg upgrade against most popular blocks:`, function () {
	before( async function () {
		if ( process.env.GUTENBERG_EDGE === 'true' ) {
			this.timeout( startBrowserTimeoutMS );
			driver = await driverManager.startBrowser();
			sampleImages = times( 3, () => mediaHelper.createFile() );
		} else {
			this.skip();
		}
	} );

	after( async function () {
		if ( sampleImages && sampleImages.length ) {
			await Promise.all(
				sampleImages.map( ( fileDetails ) => mediaHelper.deleteFile( fileDetails ) )
			);
		}
	} );

	this.timeout( mochaTimeOut );

	[
		// BlogPostsBlockComponent,
		// ContactFormBlockComponent,
		// ContactInfoBlockComponent,
		// DynamicSeparatorBlockComponent,
		// GalleryMasonryBlockComponent,
		// LayoutGridBlockComponent,
		// RatingStarBlockComponent,
		// SlideshowBlockComponent,
		SubscriptionsBlockComponent,
		TiledGalleryBlockComponent,
		YoutubeBlockComponent,
		PremiumContentBlockComponent,
	].forEach( ( Block ) => {
		describe( `${ Block.blockName } @parallel`, function () {
			let currentGutenbergBlocksCode;

			describe( `Test the block on a non-edge site`, function () {
				step( `Log in and start a new post`, async function () {
					const loginFlow = new LoginFlow( driver, 'gutenbergUpgradeUser' );

					await loginFlow.login();
					editor = await startNewPost( loginFlow );
				} );

				step( `Insert and configure the block`, async function () {
					await insertBlock( Block );
				} );

				verifyBlockInEditor( Block );

				step( 'Copy the markup for the block', async function () {
					currentGutenbergBlocksCode = await editor.getBlocksCode();
				} );

				verifyBlockInPublishedPage( Block );
			} );

			describe( `Test the same block on a corresponding edge site`, function () {
				step( `Start a new post`, async function () {
					const loginFlow = new LoginFlow( driver, 'gutenbergUpgradeEdgeUser' );

					// No need to log in again as the edge site is owned by the same user.
					editor = await startNewPost( loginFlow );
				} );

				step( 'Load the block via markup copied from the non-edge site', async function () {
					await editor.setBlocksCode( currentGutenbergBlocksCode );
				} );

				verifyBlockInEditor( Block );

				verifyBlockInPublishedPage( Block );
			} );
		} );
	} );
} );
