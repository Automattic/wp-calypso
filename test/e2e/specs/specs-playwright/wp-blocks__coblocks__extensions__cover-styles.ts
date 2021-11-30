/**
 * @group gutenberg
 * @group coblocks
 */
import {
	setupHooks,
	BrowserHelper,
	DataHelper,
	MediaHelper,
	GutenbergEditorPage,
	TestFile,
	CoverBlock,
	NewPostFlow,
} from '@automattic/calypso-e2e';
import { Frame, Page } from 'playwright';
import { TEST_IMAGE_PATH } from '../constants';

const user = BrowserHelper.targetCoBlocksEdge()
	? 'coBlocksSimpleSiteEdgeUser'
	: 'gutenbergSimpleSiteUser';

describe( DataHelper.createSuiteTitle( 'CoBlocks: Extensions: Cover Styles' ), () => {
	let page: Page;
	let newPostFlow: NewPostFlow;
	let gutenbergEditorPage: GutenbergEditorPage;
	let imageFile: TestFile;
	let coverBlock: CoverBlock;
	let editorFrame: Frame;

	setupHooks( ( args ) => {
		page = args.page;
		page.on( 'dialog', async ( dialog ) => {
			await dialog.accept();
		} );
		newPostFlow = new NewPostFlow( page );
	} );

	afterEach( async () => {
		// Prevents the autosave so we don't see the "restore from autosave" message.
		await page.evaluate( () => {
			window.sessionStorage.clear();
		} );
	} );

	beforeAll( async () => {
		imageFile = await MediaHelper.createTestFile( TEST_IMAGE_PATH );
		gutenbergEditorPage = await newPostFlow.startImmediately( user );
		editorFrame = await gutenbergEditorPage.getEditorFrame();
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
		await editorFrame.click( '[aria-label="Select Cover"]' );
	} );

	it( 'Open settings sidebar', async function () {
		await gutenbergEditorPage.openSettings();
	} );

	it.each( CoverBlock.coverStyles )( 'Verify "%s" style is available', async ( style ) => {
		await editorFrame.waitForSelector( `button[aria-label="${ style }"]` );
	} );

	it( 'Set "Bottom Wave" style', async () => {
		await coverBlock.setCoverStyle( 'Bottom Wave' );
	} );

	it( 'Publish and visit the post', async () => {
		await gutenbergEditorPage.publish( { visit: true } );
	} );

	it( 'Verify the class for "Bottom Wave" style is present', async () => {
		await page.waitForSelector( '.wp-block-cover.is-style-bottom-wave' );
	} );
} );
