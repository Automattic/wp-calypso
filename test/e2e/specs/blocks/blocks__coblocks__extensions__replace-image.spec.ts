import {
	MediaHelper,
	ElementHelper,
	EditorPage,
	TestFile,
	ImageBlock,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';
import { TEST_IMAGE_PATH } from '../constants';

test.describe( 'CoBlocks: Extensions: Replace Image', { tag: [ tags.GUTENBERG ] }, () => {
	test( 'As a user, I can replace an image using CoBlocks extension', async ( {
		page,
		accountGivenByEnvironment,
	} ) => {
		let editorPage: EditorPage;
		let imageBlock: ImageBlock;
		let imageFile: TestFile;
		let uploadedImageURL: string;
		let newImageURL: string;

		await test.step( 'Given I have a test image file', async function () {
			imageFile = await MediaHelper.createTestFile( TEST_IMAGE_PATH );
		} );

		await test.step( `And I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async function () {
			await accountGivenByEnvironment.authenticate( page );
		} );

		await test.step( 'When I go to the new post page', async function () {
			editorPage = new EditorPage( page );
			await editorPage.visit( 'post' );
		} );

		await test.step( `And I insert ${ ImageBlock.blockName } block and upload image`, async function () {
			const blockHandle = await editorPage.addBlockFromSidebar(
				ImageBlock.blockName,
				ImageBlock.blockEditorSelector
			);
			imageBlock = new ImageBlock( page, blockHandle );
			const uploadedImage = await imageBlock.upload( imageFile.fullpath );
			uploadedImageURL = ( await uploadedImage.getAttribute( 'src' ) ) as string;
			uploadedImageURL = uploadedImageURL.split( '?' )[ 0 ];
		} );

		await test.step( 'And I replace the uploaded image', async function () {
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

		await test.step( 'And I publish the post', async function () {
			await editorPage.publish( { visit: true } );
		} );

		await test.step( 'Then the new image is visible in the published post', async function () {
			// Image is not always immediately available on a published site, so we need
			// to refresh and check again.
			await ElementHelper.reloadAndRetry( page, async function () {
				const publishedImage = await page.waitForSelector( '.wp-block-image img' );
				const publishedImageURL = ( await publishedImage.getAttribute( 'src' ) ) as string;

				expect( publishedImageURL.split( '?' )[ 0 ] ).toEqual( newImageURL );
			} );
		} );
	} );
} );
