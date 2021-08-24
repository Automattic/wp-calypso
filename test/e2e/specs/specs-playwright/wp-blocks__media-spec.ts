/**
 * @group calypso-pr
 * @group gutenberg
 */

import path from 'path';
import {
	setupHooks,
	DataHelper,
	LoginFlow,
	MediaHelper,
	NewPostFlow,
	GutenbergEditorPage,
	ImageBlock,
	AudioBlock,
	FileBlock,
	TestFile,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Blocks: Media (Upload)' ), () => {
	let gutenbergEditorPage: GutenbergEditorPage;
	let page: Page;
	let testFiles: { image: TestFile; image_reserved_name: TestFile; audio: TestFile };

	setupHooks( ( args ) => {
		page = args.page;
	} );

	beforeAll( async () => {
		testFiles = {
			image: await MediaHelper.createTestImage(),
			image_reserved_name: await MediaHelper.createTestFile( {
				sourceFileName: 'image0.jpg',
				testFileName: 'filewith#?#?reservedurlchars',
			} ),
			audio: await MediaHelper.createTestAudio(),
		};
	} );

	it( 'Log in', async function () {
		const loginFlow = new LoginFlow( page, 'gutenbergSimpleSiteUser' );
		await loginFlow.logIn();
	} );

	it( 'Start new post', async function () {
		const newPostFlow = new NewPostFlow( page );
		await newPostFlow.newPostFromNavbar();
		gutenbergEditorPage = new GutenbergEditorPage( page );
	} );

	it( 'Enter post title', async function () {
		await gutenbergEditorPage.enterTitle( DataHelper.getRandomPhrase() );
	} );

	it( `${ ImageBlock.blockName } block: upload image file`, async function () {
		const blockHandle = await gutenbergEditorPage.addBlock( ImageBlock.blockName );
		const imageBlock = new ImageBlock( blockHandle );
		await imageBlock.upload( testFiles.image.fullpath );
	} );

	it( `${ ImageBlock.blockName } block: upload image file with reserved URL characters`, async function () {
		const blockHandle = await gutenbergEditorPage.addBlock( ImageBlock.blockName );
		const imageBlock = new ImageBlock( blockHandle );
		await imageBlock.upload( testFiles.image_reserved_name.fullpath );
	} );

	it( `${ AudioBlock.blockName } block: upload audio file`, async function () {
		const blockHandle = await gutenbergEditorPage.addBlock( AudioBlock.blockName );
		const audioBlock = new AudioBlock( blockHandle );
		await audioBlock.upload( testFiles.audio.fullpath );
	} );

	it( `${ FileBlock.blockName } block: upload audio file`, async function () {
		const blockHandle = await gutenbergEditorPage.addBlock( FileBlock.blockName );
		const fileBlock = new FileBlock( blockHandle );
		await fileBlock.upload( testFiles.audio.fullpath );
	} );

	it( 'Publish and visit post', async function () {
		// Must save as draft first to bypass issue with post-publish panel being auto-dismissed
		// after publishing. May be related to the following issue?
		// See https://github.com/Automattic/wp-calypso/issues/54421.
		await gutenbergEditorPage.publish( { visit: true, saveDraft: true } );
	} );

	it( `Confirm Image block is visible in published post`, async () => {
		await ImageBlock.validatePublishedContent( page, testFiles.image.filename );
	} );

	it( `Confirm Image block is visible in published post (reserved name)`, async () => {
		await ImageBlock.validatePublishedContent(
			page,
			testFiles.image_reserved_name.filename.replace( /[^a-zA-Z ]/g, '' )
		);
	} );

	it( `Confirm Audio block is visible in published post`, async () => {
		await AudioBlock.validatePublishedContent( page );
	} );

	it( `Confirm File block is visible in published post`, async () => {
		await FileBlock.validatePublishedContent( page, testFiles.audio.filename );
	} );
} );
