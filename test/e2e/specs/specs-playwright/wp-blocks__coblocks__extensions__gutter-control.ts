/**
 * @group gutenberg
 * @group coblocks
 */
import {
	setupHooks,
	BrowserHelper,
	DataHelper,
	GutenbergEditorPage,
	PricingTableBlock,
	NewPostFlow,
} from '@automattic/calypso-e2e';
import { Frame, Page } from 'playwright';

const user = BrowserHelper.targetCoBlocksEdge()
	? 'coBlocksSimpleSiteEdgeUser'
	: 'gutenbergSimpleSiteUser';

describe( DataHelper.createSuiteTitle( 'CoBlocks: Extensions: Gutter Control' ), () => {
	let page: Page;
	let gutenbergEditorPage: GutenbergEditorPage;
	let editorFrame: Frame;
	let pricingTableBlock: PricingTableBlock;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	beforeAll( async () => {
		gutenbergEditorPage = await new NewPostFlow( page ).startImmediately( user );
		editorFrame = await gutenbergEditorPage.getEditorFrame();
	} );

	it( 'Insert Pricing Table block', async function () {
		const blockHandle = await gutenbergEditorPage.addBlock(
			PricingTableBlock.blockName,
			PricingTableBlock.blockEditorSelector
		);
		pricingTableBlock = new PricingTableBlock( blockHandle );
	} );

	it( 'Open settings sidebar', async function () {
		await gutenbergEditorPage.openSettings();
	} );

	it.each( PricingTableBlock.gutterValues )(
		'Verify "%s" gutter button is present',
		async ( value ) => {
			await editorFrame.waitForSelector( `button[aria-label="${ value }"]` );
		}
	);

	it( 'Set gutter to "Huge"', async () => {
		await pricingTableBlock.setGutter( 'Huge' );
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
