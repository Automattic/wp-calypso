/**
 * @group gutenberg
 * @group coblocks
 */
import {
	setupHooks,
	BrowserHelper,
	DataHelper,
	MediaHelper,
	LoginPage,
	GutenbergEditorPage,
	TestFile,
	CoverBlock,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';
import { TEST_IMAGE_PATH } from '../constants';

let testAccount: string;
if ( BrowserHelper.targetCoBlocksEdge() ) {
	testAccount = 'coBlocksSimpleSiteEdgeUser';
} else if ( BrowserHelper.targetGutenbergEdge() ) {
	testAccount = 'gutenbergSimpleSiteEdgeUser';
} else {
	testAccount = 'gutenbergSimpleSiteUser';
}

describe( DataHelper.createSuiteTitle( 'CoBlocks: Extensions: Cover Styles' ), () => {
	let page: Page;
	let loginPage: LoginPage;
	let gutenbergEditorPage: GutenbergEditorPage;
	let imageFile: TestFile;
	let coverBlock: CoverBlock;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	beforeAll( async () => {
		imageFile = await MediaHelper.createTestFile( TEST_IMAGE_PATH );
		loginPage = new LoginPage( page );
		gutenbergEditorPage = new GutenbergEditorPage( page );
	} );

	it( 'Go to the new post page', async () => {
		await gutenbergEditorPage.visit( 'post' );
		await loginPage.logInWithTestAccount( testAccount );
	} );

	it( 'Insert Cover block', async () => {
		const blockHandle = await gutenbergEditorPage.addBlock(
			CoverBlock.blockName,
			CoverBlock.blockEditorSelector
		);
		coverBlock = new CoverBlock( blockHandle );
	} );

	it( 'Upload image', async () => {
		await coverBlock.upload( imageFile.fullpath );
		// After uploading the image the focus is switched to the inner
		// paragraph block (Cover title), so we need to switch it back outside.
		const editorFrame = await gutenbergEditorPage.getEditorFrame();
		await editorFrame.click( '.wp-block-cover', { position: { x: 1, y: 1 } } );
	} );

	it( 'Open settings sidebar', async function () {
		await gutenbergEditorPage.openSettings();
	} );

	it.each( CoverBlock.coverStyles )( 'Verify "%s" style is available', async ( style ) => {
		const editorFrame = await gutenbergEditorPage.getEditorFrame();
		await editorFrame.waitForSelector( `button[aria-label="${ style }"]` );
	} );

	it( 'Set "Bottom Wave" style', async () => {
		await coverBlock.setCoverStyle( 'Bottom Wave' );
	} );

	it( 'Close settings sidebar', async () => {
		await gutenbergEditorPage.closeSettings();
	} );

	it( 'Publish and visit the post', async () => {
		await gutenbergEditorPage.publish( { visit: true } );
	} );

	it( 'Verify the class for "Bottom Wave" style is present', async () => {
		await page.waitForSelector( '.wp-block-cover.is-style-bottom-wave' );
	} );
} );
