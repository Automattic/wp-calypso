import {
	ElementHelper,
	ImageBlock,
	MediaHelper,
	TestAccount,
	TestFile,
	envVariables,
	envToFeatureKey,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';
import { TEST_IMAGE_PATH } from '../constants';

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
test.describe( 'CoBlocks: Extensions: Replace Image', { tag: [ tags.GUTENBERG ] }, () => {
	test( 'As a user, I can replace an image in the editor', async ( { page, pageEditor } ) => {
		// Resolved here, not at describe scope: Playwright loads every spec during collection
		// regardless of --grep, so a throw for an unmatched feature key aborts the whole run.
		const accountName = getTestAccountByFeature( features );
		let imageFile: TestFile;
		let imageBlock: ImageBlock;
		let uploadedImageURL: string;
		let newImageURL: string;

		await test.step( 'Given I am authenticated', async () => {
			imageFile = await MediaHelper.createTestFile( TEST_IMAGE_PATH );
			const testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );
		} );

		await test.step( 'When I go to the new post page', async () => {
			const testAccount = new TestAccount( accountName );
			const siteSlug = testAccount.getSiteURL( { protocol: false } );
			await pageEditor.visit( 'post', { siteSlug } );
		} );

		await test.step( `When I insert ${ ImageBlock.blockName } block and upload image`, async () => {
			const blockHandle = await pageEditor.addBlockFromSidebar(
				ImageBlock.blockName,
				ImageBlock.blockEditorSelector
			);
			imageBlock = new ImageBlock( page, blockHandle );
			const uploadedImage = await imageBlock.upload( imageFile!.fullpath );
			uploadedImageURL = ( ( await uploadedImage.getAttribute( 'src' ) ) as string ).split(
				'?'
			)[ 0 ];
		} );

		await test.step( 'When I replace the uploaded image', async () => {
			const editorParent = await pageEditor.getEditorParent();
			await editorParent.locator( 'button:text("Replace")' ).click();
			await editorParent
				.locator( '.components-form-file-upload input[type="file"]' )
				.setInputFiles( imageFile!.fullpath );

			await imageBlock!.waitUntilUploaded();

			const newImage = await imageBlock!.getImage();
			newImageURL = ( ( await newImage.getAttribute( 'src' ) ) as string ).split( '?' )[ 0 ];

			expect( newImageURL ).not.toEqual( uploadedImageURL );
		} );

		await test.step( 'When I publish the post', async () => {
			await pageEditor.publish( { visit: true } );
		} );

		await test.step( 'Then the new image was published', async () => {
			await ElementHelper.reloadAndRetry( page, async function () {
				const publishedImage = await page.waitForSelector( '.wp-block-image img' );
				const publishedImageURL = ( await publishedImage.getAttribute( 'src' ) ) as string;

				expect( publishedImageURL.split( '?' )[ 0 ] ).toEqual( newImageURL );
			} );
		} );
	} );
} );
