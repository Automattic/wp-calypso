/**
 * @group gutenberg
 * @group coblocks
 */
import {
	envVariables,
	DataHelper,
	MediaHelper,
	ElementHelper,
	GutenbergEditorPage,
	TestFile,
	ImageBlock,
	TestAccount,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { TEST_IMAGE_PATH } from '../constants';

let accountName: string;
if ( envVariables.COBLOCKS_EDGE ) {
	accountName = 'coBlocksSimpleSiteEdgeUser';
} else if ( envVariables.GUTENBERG_EDGE ) {
	accountName = 'gutenbergSimpleSiteEdgeUser';
} else {
	accountName = 'gutenbergSimpleSiteUser';
}

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'CoBlocks: Extensions: Replace Image' ), () => {
	let page: Page;
	let editorPage: GutenbergEditorPage;
	let imageBlock: ImageBlock;
	let imageFile: TestFile;
	let uploadedImageURL: string;
	let newImageURL: string;

	beforeAll( async () => {
		page = await browser.newPage();
		imageFile = await MediaHelper.createTestFile( TEST_IMAGE_PATH );
		editorPage = new GutenbergEditorPage( page );

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Go to the new post page', async () => {
		await editorPage.visit( 'post' );
	} );

	it( `Insert ${ ImageBlock.blockName } block and upload image`, async () => {
		const blockHandle = await editorPage.addBlock(
			ImageBlock.blockName,
			ImageBlock.blockEditorSelector
		);
		imageBlock = new ImageBlock( blockHandle );
		const uploadedImage = await imageBlock.upload( imageFile.fullpath );
		uploadedImageURL = ( await uploadedImage.getAttribute( 'src' ) ) as string;
		uploadedImageURL = uploadedImageURL.split( '?' )[ 0 ];
	} );

	it( `Replace uploaded image`, async () => {
		const editorFrame = await editorPage.getEditorFrame();
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
		await editorPage.publish( { visit: true } );
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
