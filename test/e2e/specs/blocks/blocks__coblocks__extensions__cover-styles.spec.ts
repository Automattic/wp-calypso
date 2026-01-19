import { MediaHelper, EditorPage, TestFile, CoverBlock } from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';
import { TEST_IMAGE_PATH } from '../constants';

test.describe( 'CoBlocks: Extensions: Cover Styles', { tag: [ tags.GUTENBERG ] }, () => {
	test( 'As a user, I can apply CoBlocks cover styles', async ( {
		page,
		accountGivenByEnvironment,
	} ) => {
		let editorPage: EditorPage;
		let imageFile: TestFile;
		let coverBlock: CoverBlock;

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

		await test.step( 'And I insert a Cover block', async function () {
			const editorCanvas = await editorPage.getEditorCanvas();
			await editorPage.addBlockFromSidebar( CoverBlock.blockName, CoverBlock.blockEditorSelector );
			coverBlock = new CoverBlock( page, editorCanvas.locator( CoverBlock.blockEditorSelector ) );
		} );

		await test.step( 'And I upload an image', async function () {
			await coverBlock.upload( imageFile.fullpath );
		} );

		await test.step( 'And I open the settings sidebar', async function () {
			await editorPage.openSettings();
		} );

		await test.step( 'And I click on the Styles tab', async function () {
			await coverBlock.activateTab( 'Styles' );
		} );

		for ( const style of CoverBlock.coverStyles ) {
			await test.step( `Then the "${ style }" style is available`, async function () {
				await coverBlock.setCoverStyle( style );
			} );
		}

		await test.step( 'When I set the "Bottom Wave" style', async function () {
			await coverBlock.setCoverStyle( 'Bottom Wave' );
		} );

		await test.step( 'And I close the settings sidebar', async function () {
			await editorPage.closeSettings();
		} );

		await test.step( 'And I publish and visit the post', async function () {
			await editorPage.publish( { visit: true } );
		} );

		await test.step( 'Then the class for "Bottom Wave" style is present', async function () {
			await page.waitForSelector( '.wp-block-cover.is-style-bottom-wave' );
		} );
	} );
} );
