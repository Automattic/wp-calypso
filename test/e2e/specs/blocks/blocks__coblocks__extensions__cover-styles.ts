/**
 * @group gutenberg
 */
import {
	envVariables,
	MediaHelper,
	EditorPage,
	TestFile,
	CoverBlock,
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
describe( 'CoBlocks: Extensions: Cover Styles', function () {
	const accountName = getTestAccountByFeature( features );

	let page: Page;
	let testAccount: TestAccount;
	let editorPage: EditorPage;
	let imageFile: TestFile;
	let coverBlock: CoverBlock;

	beforeAll( async () => {
		imageFile = await MediaHelper.createTestFile( TEST_IMAGE_PATH );

		page = await browser.newPage();

		testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );

		editorPage = new EditorPage( page );
	} );

	it( 'Go to the new post page', async () => {
		await editorPage.visit( 'post' );
	} );

	it( 'Insert Cover block', async () => {
		const editorCanvas = await editorPage.getEditorCanvas();

		await editorPage.addBlockFromSidebar( CoverBlock.blockName, CoverBlock.blockEditorSelector );
		coverBlock = new CoverBlock( page, editorCanvas.locator( CoverBlock.blockEditorSelector ) );
	} );

	it( 'Upload image', async () => {
		await coverBlock.upload( imageFile.fullpath );
	} );

	it( 'Open settings sidebar', async function () {
		await editorPage.openSettings();
	} );

	it( 'Click on the Styles tab', async () => {
		await coverBlock.activateTab( 'Styles' );
	} );

	it.each( CoverBlock.coverStyles )( 'Verify "%s" style is available', async ( style ) => {
		await coverBlock.setCoverStyle( style );
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
} );
