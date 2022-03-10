/**
 * @group calypso-pr
 * @group gutenberg
 */

import {
	DataHelper,
	MediaHelper,
	GutenbergEditorPage,
	ImageBlock,
	AudioBlock,
	FileBlock,
	TestFile,
	TestAccount,
	skipItIf,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { TEST_IMAGE_PATH, TEST_AUDIO_PATH } from '../constants';

declare const browser: Browser;

describe.each`
	siteType      | accountName
	${ 'Atomic' } | ${ 'eCommerceUser' }
`(
	DataHelper.createSuiteTitle( '($siteType) Blocks: Media (Upload)' ),
	function ( { accountName } ) {
		let gutenbergEditorPage: GutenbergEditorPage;
		let page: Page;
		let testFiles: {
			image_modal: TestFile;
			image_reserved_name: TestFile;
			audio: TestFile;
		};

		beforeAll( async () => {
			page = await browser.newPage();
			testFiles = {
				image_modal: await MediaHelper.createTestFile( TEST_IMAGE_PATH ),
				image_reserved_name: await MediaHelper.createTestFile( TEST_IMAGE_PATH, {
					postfix: 'filewith#?#?reservedurlchars',
				} ),
				audio: await MediaHelper.createTestFile( TEST_AUDIO_PATH ),
			};

			const testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );

			gutenbergEditorPage = new GutenbergEditorPage( page );
		} );

		it( 'Go to new post page', async function () {
			await gutenbergEditorPage.visit( 'post' );
		} );

		it( 'Enter post title', async function () {
			await gutenbergEditorPage.enterTitle( DataHelper.getRandomPhrase() );
		} );

		describe( 'Populate post with media blocks', function () {
			it( `${ ImageBlock.blockName } block: upload image file with reserved URL characters`, async function () {
				const blockHandle = await gutenbergEditorPage.addBlock(
					ImageBlock.blockName,
					ImageBlock.blockEditorSelector
				);
				const imageBlock = new ImageBlock( blockHandle );
				await imageBlock.upload( testFiles.image_reserved_name.fullpath );
			} );

			it( `${ ImageBlock.blockName } block: upload image file using Calypso media modal `, async function () {
				// It'd be great if I could use `skipItIf` but due to the async nature of jest methods,
				// it's not possible to access `gutenbergEditorPage.isGutenframe` when calling it.
				// It'd be great if Jest provided a way to programmatically skip a test as it runs
				// but I haven't found a way to do it yet.
				if ( ! gutenbergEditorPage.isGutenframe ) return;

				const blockHandle = await gutenbergEditorPage.addBlock(
					ImageBlock.blockName,
					ImageBlock.blockEditorSelector
				);
				const imageBlock = new ImageBlock( blockHandle );

				await imageBlock.selectImageSource( 'Media Library' );
				await imageBlock.uploadFromModal( testFiles.image_modal.fullpath );
			} );

			it( `${ AudioBlock.blockName } block: upload audio file`, async function () {
				const blockHandle = await gutenbergEditorPage.addBlock(
					AudioBlock.blockName,
					AudioBlock.blockEditorSelector
				);
				const audioBlock = new AudioBlock( blockHandle );
				await audioBlock.upload( testFiles.audio.fullpath );
			} );

			it( `${ FileBlock.blockName } block: upload audio file`, async function () {
				const blockHandle = await gutenbergEditorPage.addBlock(
					FileBlock.blockName,
					FileBlock.blockEditorSelector
				);
				const fileBlock = new FileBlock( blockHandle );
				await fileBlock.upload( testFiles.audio.fullpath );
			} );

			it( 'Publish and visit post', async function () {
				await gutenbergEditorPage.saveDraft();
				await gutenbergEditorPage.publish( { visit: true } );
			} );
		} );

		describe( 'Validate published post', function () {
			it( `Image with reserved characters in filename is visible`, async function () {
				await ImageBlock.validatePublishedContent( page, [
					testFiles.image_reserved_name.filename.replace( /[^a-zA-Z ]/g, '' ),
				] );
			} );

			it( 'Image added via Calypso modal is visible', async function () {
				// It'd be great if I could use `skipItIf` but due to the async nature of jest methods,
				// it's not possible to access `gutenbergEditorPage.isGutenframe` when calling it.
				// It'd be great if Jest provided a way to programmatically skip a test as it runs
				// but I haven't found a way to do it yet.
				if ( ! gutenbergEditorPage.isGutenframe ) return;
				await ImageBlock.validatePublishedContent( page, [ testFiles.image_modal.filename ] );
			} );

			it( `Audio block is visible`, async function () {
				await AudioBlock.validatePublishedContent( page );
			} );

			it( `File block is visible`, async function () {
				await FileBlock.validatePublishedContent( page, [ testFiles.audio.filename ] );
			} );
		} );
	}
);
