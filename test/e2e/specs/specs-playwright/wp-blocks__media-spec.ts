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

	const testFiles = {
		image: MediaHelper.createTestImage(),
		image_reserved_name: MediaHelper.createTestFile( {
			sourceFileName: 'image0.jpg',
			testFileName: 'filewith#?#?reservedurlchars',
		} ),
		audio: MediaHelper.createTestAudio(),
	};

	setupHooks( ( args ) => {
		page = args.page;
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

	// Pass in a 1D array of values or text strings to validate each block.
	// The full filename (name.extension) is not used within the Image block, but the file name is.
	// `path.parse` is called to trim the extension.
	it.each`
		block           | content
		${ ImageBlock } | ${ [ path.parse( testFiles.image ).name ] }
		${ ImageBlock } | ${ [ path.parse( testFiles.image_reserved_name ).name.replace( /[^a-zA-Z ]/g, '' ) ] }
		${ AudioBlock } | ${ [ path.parse( testFiles.audio ).base ] }
		${ FileBlock }  | ${ [ path.parse( testFiles.audio ).name ] }
	`(
		`Confirm $block.blockName block is visible in published post`,
		async ( { block, content } ) => {
			// Pass the Block object class here then call the static method to validate.
			await block.validatePublishedContent( page, content );
		}
	);
} );
