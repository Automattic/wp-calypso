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
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { TEST_IMAGE_PATH, TEST_AUDIO_PATH } from '../constants';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Blocks: Media (Upload)' ), function () {
	let gutenbergEditorPage: GutenbergEditorPage;
	let page: Page;
	let testFiles: {
		image: TestFile;
		image_modal: TestFile;
		image_reserved_name: TestFile;
		audio: TestFile;
	};

	beforeAll( async () => {
		page = await browser.newPage();
		testFiles = {
			image: await MediaHelper.createTestFile( TEST_IMAGE_PATH ),
			image_modal: await MediaHelper.createTestFile( TEST_IMAGE_PATH ),
			image_reserved_name: await MediaHelper.createTestFile( TEST_IMAGE_PATH, {
				postfix: 'filewith#?#?reservedurlchars',
			} ),
			audio: await MediaHelper.createTestFile( TEST_AUDIO_PATH ),
		};

		const testAccount = new TestAccount( 'simpleSitePersonalPlanUser' );
		await testAccount.authenticate( page );

		gutenbergEditorPage = new GutenbergEditorPage( page );
	} );

	it( 'Go to new post page', async function () {
		await gutenbergEditorPage.visit( 'post' );
	} );

	it( 'Enter post title', async function () {
		await gutenbergEditorPage.enterTitle( DataHelper.getRandomPhrase() );
	} );

	it( `${ ImageBlock.blockName } block: upload image file`, async function () {
		const blockHandle = await gutenbergEditorPage.addBlock(
			ImageBlock.blockName,
			ImageBlock.blockEditorSelector
		);
		const imageBlock = new ImageBlock( blockHandle );
		await imageBlock.upload( testFiles.image.fullpath );
	} );

	it( `${ ImageBlock.blockName } block: upload image file with reserved URL characters`, async function () {
		const blockHandle = await gutenbergEditorPage.addBlock(
			ImageBlock.blockName,
			ImageBlock.blockEditorSelector
		);
		const imageBlock = new ImageBlock( blockHandle );
		await imageBlock.upload( testFiles.image_reserved_name.fullpath );
	} );

	it( `${ ImageBlock.blockName } block: upload image file using Calypso media modal `, async function () {
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

	it( `Confirm Image block is visible in published post`, async function () {
		await ImageBlock.validatePublishedContent( page, [ testFiles.image.filename ] );
	} );

	it( `Confirm Image block is visible in published post (reserved name)`, async function () {
		await ImageBlock.validatePublishedContent( page, [
			testFiles.image_reserved_name.filename.replace( /[^a-zA-Z ]/g, '' ),
		] );
	} );

	it( `Confirm Audio block is visible in published post`, async function () {
		await AudioBlock.validatePublishedContent( page );
	} );

	it( `Confirm File block is visible in published post`, async function () {
		await FileBlock.validatePublishedContent( page, [ testFiles.audio.filename ] );
	} );
} );
