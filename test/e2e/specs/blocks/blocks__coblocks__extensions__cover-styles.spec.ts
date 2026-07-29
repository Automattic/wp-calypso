import {
	CoverBlock,
	MediaHelper,
	TestAccount,
	TestFile,
	envVariables,
	envToFeatureKey,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';
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
test.describe( 'CoBlocks: Extensions: Cover Styles', { tag: [ tags.GUTENBERG ] }, () => {
	test( 'As a user, I can change CoBlocks cover styles', async ( { page, pageEditor } ) => {
		// Resolved here, not at describe scope: Playwright loads every spec during collection
		// regardless of --grep, so a throw for an unmatched feature key aborts the whole run.
		const accountName = getTestAccountByFeature( features );
		let imageFile: TestFile;
		let coverBlock: CoverBlock;

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

		await test.step( 'When I insert Cover block', async () => {
			const editorCanvas = await pageEditor.getEditorCanvas();
			await pageEditor.addBlockFromSidebar( CoverBlock.blockName, CoverBlock.blockEditorSelector );
			coverBlock = new CoverBlock( page, editorCanvas.locator( CoverBlock.blockEditorSelector ) );
		} );

		await test.step( 'When I upload image', async () => {
			await coverBlock!.upload( imageFile!.fullpath );
		} );

		await test.step( 'When I open settings sidebar', async () => {
			await pageEditor.openSettings();
		} );

		await test.step( 'When I click on the Styles tab', async () => {
			await coverBlock!.activateTab( 'Styles' );
		} );

		for ( const style of CoverBlock.coverStyles ) {
			await test.step( `When I verify "${ style }" style is available`, async () => {
				await coverBlock!.setCoverStyle( style );
			} );
		}

		await test.step( 'When I set "Bottom Wave" style', async () => {
			await coverBlock!.setCoverStyle( 'Bottom Wave' );
		} );

		await test.step( 'When I close settings sidebar', async () => {
			await pageEditor.closeSettings();
		} );

		await test.step( 'When I publish and visit the post', async () => {
			await pageEditor.publish( { visit: true } );
		} );

		await test.step( 'Then the class for "Bottom Wave" style is present', async () => {
			await page.waitForSelector( '.wp-block-cover.is-style-bottom-wave' );
		} );
	} );
} );
