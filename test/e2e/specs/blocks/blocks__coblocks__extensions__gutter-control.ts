/**
 * @group gutenberg
 * @group coblocks
 */
import {
	envVariables,
	DataHelper,
	EditorPage,
	PricingTableBlock,
	TestAccount,
	getTestAccountByFeature,
	envToFeatureKey,
	skipDescribeIf,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

const features = envToFeatureKey( envVariables );

skipDescribeIf( features.siteType === 'atomic' )(
	DataHelper.createSuiteTitle( 'CoBlocks: Extensions: Gutter Control' ),
	() => {
		const accountName = getTestAccountByFeature( features );

		let page: Page;
		let testAccount: TestAccount;
		let editorPage: EditorPage;
		let pricingTableBlock: PricingTableBlock;

		beforeAll( async () => {
			page = await browser.newPage();
			testAccount = new TestAccount( accountName );
			editorPage = new EditorPage( page, { target: features.siteType } );

			await testAccount.authenticate( page );
		} );

		it( 'Go to the new post page', async () => {
			await editorPage.visit( 'post' );
		} );

		it( 'Insert Pricing Table block', async () => {
			const blockHandle = await editorPage.addBlockFromSidebar(
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
				const editorFrame = await editorPage.getEditorHandle();
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
	}
);
