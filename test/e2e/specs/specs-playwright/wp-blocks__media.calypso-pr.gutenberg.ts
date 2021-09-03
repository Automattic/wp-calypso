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
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Blocks: Media (Upload)' ), () => {
	let gutenbergEditorPage: GutenbergEditorPage;
	let page: Page;
	let testFiles: { image: string; image_reserved_name: string; audio: string };

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
		await imageBlock.upload( testFiles.image );
	} );

	it( `${ ImageBlock.blockName } block: upload image file with reserved URL characters`, async function () {
		const blockHandle = await gutenbergEditorPage.addBlock( ImageBlock.blockName );
		const imageBlock = new ImageBlock( blockHandle );
		await imageBlock.upload( testFiles.image_reserved_name );
	} );

	it( `${ AudioBlock.blockName } block: upload audio file`, async function () {
		const blockHandle = await gutenbergEditorPage.addBlock( AudioBlock.blockName );
		const audioBlock = new AudioBlock( blockHandle );
		await audioBlock.upload( testFiles.audio );
	} );

	it( `${ FileBlock.blockName } block: upload audio file`, async function () {
		const blockHandle = await gutenbergEditorPage.addBlock( FileBlock.blockName );
		const fileBlock = new FileBlock( blockHandle );
		await fileBlock.upload( testFiles.audio );
	} );

	it( 'Publish and visit post', async function () {
		await gutenbergEditorPage.publish( { visit: true } );
	} );

	it( `Confirm Image block is visible in published post`, async () => {
		await ImageBlock.validatePublishedContent( page, path.parse( testFiles.image ).name );
	} );

	it( `Confirm Image block is visible in published post (reserved name)`, async () => {
		await ImageBlock.validatePublishedContent(
			page,
			path.parse( testFiles.image_reserved_name ).name.replace( /[^a-zA-Z ]/g, '' )
		);
	} );

	it( `Confirm Audio block is visible in published post`, async () => {
		await AudioBlock.validatePublishedContent( page );
	} );

	it( `Confirm File block is visible in published post`, async () => {
		await FileBlock.validatePublishedContent( page, path.parse( testFiles.audio ).name );
	} );
} );
