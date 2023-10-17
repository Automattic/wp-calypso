/**
 * @group gutenberg
 */
import {
	envVariables,
	MediaHelper,
	ElementHelper,
	EditorPage,
	TestFile,
	ImageBlock,
	TestAccount,
	getTestAccountByFeature,
	envToFeatureKey,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { TEST_IMAGE_PATH } from '../constants';

declare const browser: Browser;

const features = envToFeatureKey( envVariables );
// For this spec, all Atomic testing is always edge.
// See https://github.com/Automattic/wp-calypso/pull/73052
if ( envVariables.TEST_ON_ATOMIC ) {
	features.coblocks = 'edge';
}

/**
 * This spec requires the following:
 * 	- theme: a non-block-based theme (eg. Twenty-Twenty One)
 */
describe( 'CoBlocks: Extensions: Replace Image', function () {
	const accountName = getTestAccountByFeature( features );

	let page: Page;
	let editorPage: EditorPage;
	let imageBlock: ImageBlock;
	let imageFile: TestFile;
	let uploadedImageURL: string;
	let newImageURL: string;

	beforeAll( async () => {
		page = await browser.newPage();
		imageFile = await MediaHelper.createTestFile( TEST_IMAGE_PATH );
		editorPage = new EditorPage( page );

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Go to the new post page', async () => {
		await editorPage.visit( 'post' );
	} );

	it( `Insert ${ ImageBlock.blockName } block and upload image`, async () => {
		const blockHandle = await editorPage.addBlockFromSidebar(
			ImageBlock.blockName,
			ImageBlock.blockEditorSelector
		);
		imageBlock = new ImageBlock( page, blockHandle );
		const uploadedImage = await imageBlock.upload( imageFile.fullpath );
		uploadedImageURL = ( await uploadedImage.getAttribute( 'src' ) ) as string;
		uploadedImageURL = uploadedImageURL.split( '?' )[ 0 ];
	} );

	it( `Replace uploaded image`, async () => {
		const editorParent = await editorPage.getEditorParent();
		await editorParent.locator( 'button:text("Replace")' ).click();
		await editorParent
			.locator( '.components-form-file-upload input[type="file"]' )
			.setInputFiles( imageFile.fullpath );

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
