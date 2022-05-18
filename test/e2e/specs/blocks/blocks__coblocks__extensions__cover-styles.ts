/**
 * @group gutenberg
 * @group coblocks
 */
import {
	envVariables,
	DataHelper,
	MediaHelper,
	EditorPage,
	TestFile,
	CoverBlock,
	TestAccount,
	getTestAccountByFeature,
	envToFeatureKey,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { skipDescribeIf } from '../../jest-helpers';
import { TEST_IMAGE_PATH } from '../constants';

declare const browser: Browser;

const features = envToFeatureKey( envVariables );

skipDescribeIf( features.siteType === 'atomic' )(
	DataHelper.createSuiteTitle( 'CoBlocks: Extensions: Cover Styles' ),
	() => {
		const accountName = getTestAccountByFeature( features );

		let page: Page;
		let testAccount: TestAccount;
		let editorPage: EditorPage;
		let imageFile: TestFile;
		let coverBlock: CoverBlock;

		beforeAll( async () => {
			page = await browser.newPage();
			imageFile = await MediaHelper.createTestFile( TEST_IMAGE_PATH );
			testAccount = new TestAccount( accountName );
			editorPage = new EditorPage( page, { target: features.siteType } );

			await testAccount.authenticate( page );
		} );

		it( 'Go to the new post page', async () => {
			await editorPage.visit( 'post' );
		} );

		it( 'Insert Cover block', async () => {
			const blockHandle = await editorPage.addBlockFromSidebar(
				CoverBlock.blockName,
				CoverBlock.blockEditorSelector
			);
			coverBlock = new CoverBlock( blockHandle );
		} );

		it( 'Upload image', async () => {
			await coverBlock.upload( imageFile.fullpath );
			// After uploading the image the focus is switched to the inner
			// paragraph block (Cover title), so we need to switch it back outside.
			const editorFrame = await editorPage.getEditorHandle();
			await editorFrame.click( '.wp-block-cover', { position: { x: 1, y: 1 } } );
		} );

		it( 'Open settings sidebar', async function () {
			await editorPage.openSettings();
		} );

		it.each( CoverBlock.coverStyles )( 'Verify "%s" style is available', async ( style ) => {
			const editorFrame = await editorPage.getEditorHandle();
			await editorFrame.waitForSelector( `button[aria-label="${ style }"]` );
		} );

		it( 'Set "Bottom Wave" style', async () => {
			await coverBlock.setCoverStyle( 'Bottom Wave' );
		} );

		it( 'Close settings sidebar', async () => {
			await editorPage.closeSettings();
		} );

		it( 'Publish and visit the post', async () => {
			await editorPage.publish( { visit: true } );
		} );

		it( 'Verify the class for "Bottom Wave" style is present', async () => {
			await page.waitForSelector( '.wp-block-cover.is-style-bottom-wave' );
		} );
	}
);
