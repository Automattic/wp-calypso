/**
 * @group gutenberg
 * @group coblocks
 */
import path from 'path';
import {
	BrowserHelper,
	DataHelper,
	GutenbergEditorPage,
	ImageBlock,
	LoginFlow,
	MediaHelper,
	PricingTableBlock,
	setupHooks,
	TestFile,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';
import { TEST_IMAGE_PATH } from '../constants';

const user = BrowserHelper.targetCoBlocksEdge()
	? 'coBlocksSimpleSiteEdgeUser'
	: 'gutenbergSimpleSiteUser';

const siteHost = DataHelper.getAccountSiteURL( user, { protocol: false } );
const calypsoURL = DataHelper.getCalypsoURL();

async function startNewPost( page: Page ): Promise< GutenbergEditorPage > {
	await page.goto( path.join( calypsoURL, 'post', siteHost ) );
	return new GutenbergEditorPage( page );
}

describe( DataHelper.createSuiteTitle( 'CoBlocks: Extensions' ), () => {
	let gutenbergEditorPage: GutenbergEditorPage;
	let page: Page;

	let user: string;
	if ( BrowserHelper.targetCoBlocksEdge() ) {
		user = 'coBlocksSimpleSiteEdgeUser';
	} else if ( BrowserHelper.targetGutenbergEdge() ) {
		user = 'gutenbergSimpleSiteEdgeUser';
	} else {
		user = 'gutenbergSimpleSiteUser';
	}

	setupHooks( ( args ) => {
		page = args.page;
		page.on( 'dialog', async ( dialog ) => {
			await dialog.accept();
		} );
	} );

	beforeAll( async () => {
		await new LoginFlow( page, user ).logIn();
	} );

	afterEach( async () => {
		await page.evaluate( () => {
			window.sessionStorage.clear();
		} );
	} );

	describe( 'Gutter Control', () => {
		let pricingTableBlock: PricingTableBlock;

		beforeAll( async () => {
			gutenbergEditorPage = await startNewPost( page );
		} );

		it( 'Insert Pricing Table block', async function () {
			const blockHandle = await gutenbergEditorPage.addBlock(
				PricingTableBlock.blockName,
				PricingTableBlock.blockEditorSelector
			);
			pricingTableBlock = new PricingTableBlock( blockHandle );
		} );

		it( 'Open settings sidebar', async function () {
			await gutenbergEditorPage.openSettings();
		} );

		it.each( PricingTableBlock.gutterValues )( 'Set gutter value to %s', async ( value ) => {
			await pricingTableBlock.setGutter( value );
		} );
	} );

	describe( 'Replace Image', () => {
		let imageBlock: ImageBlock;
		let imageFile: TestFile;
		let uploadedImagePath: string;

		beforeAll( async () => {
			imageFile = await MediaHelper.createTestFile( TEST_IMAGE_PATH );
			gutenbergEditorPage = await startNewPost( page );
		} );

		it( `Insert ${ ImageBlock.blockName } block and upload image`, async () => {
			const blockHandle = await gutenbergEditorPage.addBlock(
				ImageBlock.blockName,
				ImageBlock.blockEditorSelector
			);
			imageBlock = new ImageBlock( blockHandle );
			const uploadedImage = await imageBlock.upload( imageFile.fullpath );
			uploadedImagePath = await uploadedImage.getAttribute( 'src' );
		} );

		it( `Replace uploaded image`, async () => {
			const editorFrame = await gutenbergEditorPage.getEditorFrame();

			await editorFrame.click( 'button:text("Replace")' );
			await editorFrame.setInputFiles(
				'.components-form-file-upload input[type="file"]',
				imageFile.fullpath
			);
			await imageBlock.waitUntilUploaded();
			const newImage = await imageBlock.getImage();
			const newImagePath = await newImage.getAttribute( 'src' );

			expect( uploadedImagePath ).not.toBe( newImagePath );
		} );
	} );
} );
