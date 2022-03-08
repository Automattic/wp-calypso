/**
 * @group gutenberg
 * @group coblocks
 */
import {
	envVariables,
	DataHelper,
	GutenbergEditorPage,
	PricingTableBlock,
	TestAccount,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

let accountName: string;
if ( envVariables.COBLOCKS_EDGE ) {
	accountName = 'coBlocksSimpleSiteEdgeUser';
} else if ( envVariables.GUTENBERG_EDGE ) {
	accountName = 'gutenbergSimpleSiteEdgeUser';
} else {
	accountName = 'gutenbergSimpleSiteUser';
}

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'CoBlocks: Extensions: Gutter Control' ), () => {
	let page: Page;
	let testAccount: TestAccount;
	let editorPage: GutenbergEditorPage;
	let pricingTableBlock: PricingTableBlock;

	beforeAll( async () => {
		page = await browser.newPage();
		testAccount = new TestAccount( accountName );
		editorPage = new GutenbergEditorPage( page );

		await testAccount.authenticate( page );
	} );

	it( 'Go to the new post page', async () => {
		await editorPage.visit( 'post' );
	} );

	it( 'Insert Pricing Table block', async () => {
		const blockHandle = await editorPage.addBlock(
			PricingTableBlock.blockName,
			PricingTableBlock.blockEditorSelector
		);
		pricingTableBlock = new PricingTableBlock( blockHandle );
	} );

	it( 'Open settings sidebar', async () => {
		await editorPage.openSettings();
	} );

	it.each( PricingTableBlock.gutterValues )(
		'Verify "%s" gutter button is present',
		async ( value ) => {
			const editorFrame = await editorPage.getEditorFrame();
			await editorFrame.waitForSelector( `button[aria-label="${ value }"]` );
		}
	);

	it( 'Set gutter to "Huge"', async () => {
		await pricingTableBlock.setGutter( 'Huge' );
	} );

	it( 'Close settings sidebar', async () => {
		await editorPage.closeSettings();
	} );

	it( 'Fill the price fields so the block is visible', async () => {
		await pricingTableBlock.enterPrice( 1, 4.99 );
		await pricingTableBlock.enterPrice( 2, 9.99 );
	} );

	it( 'Publish and visit the post', async () => {
		await editorPage.publish( { visit: true } );
	} );

	it( 'Verify the class for "Huge" gutter is present', async () => {
		await page.waitForSelector( '.wp-block-coblocks-pricing-table .has-huge-gutter' );
	} );
} );
