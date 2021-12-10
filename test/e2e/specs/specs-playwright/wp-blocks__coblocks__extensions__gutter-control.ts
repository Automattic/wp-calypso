/**
 * @group gutenberg
 * @group coblocks
 */
import {
	setupHooks,
	BrowserHelper,
	DataHelper,
	LoginPage,
	GutenbergEditorPage,
	PricingTableBlock,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

let testAccount: string;
if ( BrowserHelper.targetCoBlocksEdge() ) {
	testAccount = 'coBlocksSimpleSiteEdgeUser';
} else if ( BrowserHelper.targetGutenbergEdge() ) {
	testAccount = 'gutenbergSimpleSiteEdgeUser';
} else {
	testAccount = 'gutenbergSimpleSiteUser';
}

describe( DataHelper.createSuiteTitle( 'CoBlocks: Extensions: Gutter Control' ), () => {
	let page: Page;
	let loginPage: LoginPage;
	let gutenbergEditorPage: GutenbergEditorPage;
	let pricingTableBlock: PricingTableBlock;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	beforeAll( async () => {
		loginPage = new LoginPage( page );
		gutenbergEditorPage = new GutenbergEditorPage( page );
	} );

	it( 'Go to the new post page', async () => {
		await gutenbergEditorPage.visit( 'post' );
		await loginPage.logInWithTestAccount( testAccount );
	} );

	it( 'Insert Pricing Table block', async () => {
		const blockHandle = await gutenbergEditorPage.addBlock(
			PricingTableBlock.blockName,
			PricingTableBlock.blockEditorSelector
		);
		pricingTableBlock = new PricingTableBlock( blockHandle );
	} );

	it( 'Open settings sidebar', async () => {
		await gutenbergEditorPage.openSettings();
	} );

	it.each( PricingTableBlock.gutterValues )(
		'Verify "%s" gutter button is present',
		async ( value ) => {
			const editorFrame = await gutenbergEditorPage.getEditorFrame();
			await editorFrame.waitForSelector( `button[aria-label="${ value }"]` );
		}
	);

	it( 'Set gutter to "Huge"', async () => {
		await pricingTableBlock.setGutter( 'Huge' );
	} );

	it( 'Close settings sidebar', async () => {
		await gutenbergEditorPage.closeSettings();
	} );

	it( 'Fill the price fields so the block is visible', async () => {
		await pricingTableBlock.enterPrice( 1, 4.99 );
		await pricingTableBlock.enterPrice( 2, 9.99 );
	} );

	it( 'Publish and visit the post', async () => {
		await gutenbergEditorPage.publish( { visit: true } );
	} );

	it( 'Verify the class for "Huge" gutter is present', async () => {
		await page.waitForSelector( '.wp-block-coblocks-pricing-table .has-huge-gutter' );
	} );
} );
