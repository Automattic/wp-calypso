/**
 * @group gutenberg
 * @group coblocks
 */
import {
	setupHooks,
	BrowserHelper,
	DataHelper,
	MediaHelper,
	ElementHelper,
	LoginPage,
	GutenbergEditorPage,
	TestFile,
	ImageBlock,
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

describe( DataHelper.createSuiteTitle( 'CoBlocks: Extensions: Replace Image' ), () => {
	let page: Page;
	let loginPage: LoginPage;
	let gutenbergEditorPage: GutenbergEditorPage;
	let imageBlock: ImageBlock;
	let imageFile: TestFile;
	let uploadedImageURL: string;
	let newImageURL: string;

	setupHooks( async ( args ) => {
		page = args.page;
		imageFile = await MediaHelper.createTestFile( TEST_IMAGE_PATH );
		loginPage = new LoginPage( page );
		gutenbergEditorPage = new GutenbergEditorPage( page );
	} );

	it( `Log in as ${ testAccount }`, async () => {
		await loginPage.logInWithTestAccount( testAccount );
	} );

	it( 'Go to the new post page', async () => {
		await gutenbergEditorPage.visit( 'post' );
	} );

	it( `Insert ${ ImageBlock.blockName } block and upload image`, async () => {
		const blockHandle = await gutenbergEditorPage.addBlock(
			ImageBlock.blockName,
			ImageBlock.blockEditorSelector
		);
		imageBlock = new ImageBlock( blockHandle );
		const uploadedImage = await imageBlock.upload( imageFile.fullpath );
		uploadedImageURL = ( await uploadedImage.getAttribute( 'src' ) ) as string;
		uploadedImageURL = uploadedImageURL.split( '?' )[ 0 ];
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
		newImageURL = ( await newImage.getAttribute( 'src' ) ) as string;
		newImageURL = newImageURL.split( '?' )[ 0 ];

		expect( newImageURL ).not.toEqual( uploadedImageURL );
	} );

	it( 'Publish the post', async () => {
		await gutenbergEditorPage.publish( { visit: true } );
	} );

	it( 'Verify the new image was published', async () => {
		// Image is not always immediately available on a published site, so we need
		// to refresh and check again.
		await ElementHelper.reloadAndRetry( page, async function () {
			const publishedImage = await page.waitForSelector( '.wp-block-image img' );
			const publishedImageURL = ( await publishedImage.getAttribute( 'src' ) ) as string;

			expect( publishedImageURL.split( '?' )[ 0 ] ).toEqual( newImageURL );
		} );
	} );
} );
