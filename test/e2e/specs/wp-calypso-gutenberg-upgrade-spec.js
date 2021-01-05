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

import ReaderPage from '../lib/pages/reader-page';

import NavBarComponent from '../lib/components/nav-bar-component.js';

import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component';

import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';
import * as mediaHelper from '../lib/media-helper';
import * as driverHelper from '../lib/driver-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const themedSites = dataHelper.configGet( 'themedSites' );

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

let currentGutenbergBlocksCode;
let sampleImages;

const blockInits = new Map()
	.set( TiledGalleryBlockComponent, ( block ) => block.uploadImages( sampleImages ) )
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
	.set( ContactInfoBlockComponent, ( block ) =>
		block.fillUp( {
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
		} )
	)
	.set( YoutubeBlockComponent, ( block ) =>
		block.embed( 'https://www.youtube.com/watch?v=FhMO5QnRNvo' )
	)
	.set( DynamicSeparatorBlockComponent, ( block ) => block.resizeBy( 150 ) )
	.set( SlideshowBlockComponent, ( block ) => block.uploadImages( sampleImages ) )
	.set( GalleryMasonryBlockComponent, ( block ) => block.uploadImages( sampleImages ) );

/**
 * Wrapper that provides an uniform API for creating blocks on the page. It uses the `inits`
 * dictionary defined in this module. If an entry is not found for the passed `blockClass`, it
 * fall-backs to just inserting the block on the page.
 *
 * IMPORTANT: It relies on the `gEditorComponent` having a proper instance of
 * `GutenbergEditorComponent`, so make sure to call it only when this instance is available.
 *
 * @param { Function } blockClass A block class.
 * @returns { Function } the init function to be called.
 */
async function insertBlock( blockClass ) {
	const blockInit = blockInits.get( blockClass );
	const block = await this.gEditorComponent.insertBlock( blockClass );

	return blockInit && blockInit( block );
}

async function assertNoErrorInEditor() {
	const errorDisplayed = await this.gEditorComponent.errorDisplayed();
	assert.strictEqual( errorDisplayed, false, 'The block errored in the editor!' );
}

/**
 * Re-usable collection of steps for verifying blocks in the editor.
 *
 * @param { Function } blockClass A block class.
 */
function verifyBlockInEditor( blockClass ) {
	step( 'Block is displayed in the editor', async function () {
		const displayed = await this.gEditorComponent.blockDisplayedInEditor( blockClass.blockName );
		assert.strictEqual(
			displayed,
			true,
			`The block "${ blockClass.blockName }" was not found in the editor`
		);
	} );

	step( 'Block does not error in the editor', async function () {
		await assertNoErrorInEditor();
	} );
}

/**
 * Re-usable collection of steps for verifying blocks in the frontend/published page.
 *
 * @param { Function } blockClass A block class.
 */
function verifyBlockInPublishedPage( blockClass ) {
	step( 'Publish page', async function () {
		await this.gEditorComponent.publish( { visit: true } );
	} );

	/**
	 * This is a temporary hack for this changeset to skip checking some blocks in the frontend until
	 * they are properly setup (which is done in subsequent PRs). Some blocks will not appear if not
	 * properly configured/filled with sample attributes or assets. This guard and comment will
	 * eventually be removed.
	 */
	if ( ! [ YoutubeBlockComponent, SlideshowBlockComponent ].includes( blockClass ) ) {
		step( 'Block is displayed in the published page', async function () {
			await driverHelper.waitTillPresentAndDisplayed(
				this.driver,
				blockClass.blockFrontendSelector
			);
		} );
	}
}

async function startNewPost( siteURL ) {
	await ReaderPage.Visit( this.driver );
	await NavBarComponent.Expect( this.driver );

	const navbarComponent = await NavBarComponent.Expect( this.driver );
	await navbarComponent.clickCreateNewPost( { siteURL } );

	this.gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
	await this.gEditorComponent.initEditor();
}

describe( `[${ host }] Test Gutenberg upgrade from non-edge to edge across most popular themes (${ screenSize })`, function () {
	before( async function () {
		if ( process.env.GUTENBERG_EDGE === 'true' ) {
			this.timeout( startBrowserTimeoutMS );
			this.driver = await driverManager.startBrowser();
			this.loginFlow = new LoginFlow( this.driver, 'gutenbergUpgradeUser' );
			sampleImages = times( 5, () => mediaHelper.createFile() );
		} else {
			this.skip();
		}
	} );

	after( async function () {
		if ( process.env.GUTENBERG_EDGE === 'true' ) {
			await Promise.all(
				sampleImages.map( ( fileDetails ) => mediaHelper.deleteFile( fileDetails ) )
			);
		}
	} );

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
		PremiumContentBlockComponent,
	].forEach( ( blockClass ) => {
		themedSites.forEach( ( siteName ) => {
			describe( `Test the ${ blockClass.blockName } block on ${ siteName } @parallel`, function () {
				const edgeSiteName = siteName + 'edge';
				const siteURL = `${ siteName }.wordpress.com`;

				describe( `Test the block in the non-edge site (${ siteName })`, function () {
					step( `Login to ${ siteName }`, async function () {
						await this.loginFlow.login( siteURL, true );
						await startNewPost( siteURL );
					} );

					step( `Insert and configure ${ blockClass.blockName }`, async function () {
						await insertBlock( blockClass );
					} );

					verifyBlockInEditor( blockClass, siteName );

					step( 'Copy the markup for the block', async function () {
						currentGutenbergBlocksCode = await this.gEditorComponent.getBlocksCode();
					} );

					verifyBlockInPublishedPage( blockClass, siteName );
				} );

				describe( `Test the same block in the corresponding edge site (${ edgeSiteName })`, function () {
					const edgeSiteURL = `${ edgeSiteName }.wordpress.com`;

					step( `Switches to edge site (${ edgeSiteName })`, async function () {
						await startNewPost( edgeSiteURL );
					} );

					step( 'Load block via markup copied from non-edge site', async function () {
						await this.gEditorComponent.setBlocksCode( currentGutenbergBlocksCode );
					} );

					verifyBlockInEditor( blockClass, edgeSiteName );
					verifyBlockInPublishedPage( blockClass, edgeSiteName );
				} );
			} );
		} );
	} );
} );
