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
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

const accountName = getTestAccountByFeature( {
	coblocks: envVariables.COBLOCKS_EDGE ? 'edge' : undefined,
	gutenberg: envVariables.GUTENBERG_EDGE ? 'edge' : 'stable',
	siteType: envVariables.TEST_ON_ATOMIC ? 'atomic' : 'simple',
} );

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'CoBlocks: Extensions: Gutter Control' ), () => {
	let page: Page;
	let testAccount: TestAccount;
	let gutenbergEditorPage: GutenbergEditorPage;
	let pricingTableBlock: PricingTableBlock;

	beforeAll( async () => {
		page = await browser.newPage();
		testAccount = new TestAccount( accountName );
		gutenbergEditorPage = new GutenbergEditorPage( page );

		await testAccount.authenticate( page );
	} );

	it( 'Go to the new post page', async () => {
		await gutenbergEditorPage.visit( 'post' );
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
