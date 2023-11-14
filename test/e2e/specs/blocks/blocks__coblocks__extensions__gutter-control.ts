/**
 * @group gutenberg
 */
import {
	envVariables,
	EditorPage,
	PricingTableBlock,
	TestAccount,
	getTestAccountByFeature,
	envToFeatureKey,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { skipItIf } from '../../jest-helpers';

declare const browser: Browser;

const isAtomic = envVariables.TEST_ON_ATOMIC;
const isSimple = ! envVariables.TEST_ON_ATOMIC;
const features = envToFeatureKey( envVariables );
// For this spec, all Atomic testing is always edge.
// See https://github.com/Automattic/wp-calypso/pull/73052
if ( isAtomic ) {
	features.coblocks = 'edge';
}

/**
 * This spec requires the following:
 * 	- theme: a non-block-based theme (eg. Twenty-Twenty One)
 */
describe( 'CoBlocks: Extensions: Gutter Control', function () {
	const accountName = getTestAccountByFeature( features );

	let page: Page;
	let testAccount: TestAccount;
	let editorPage: EditorPage;
	let pricingTableBlock: PricingTableBlock;

	beforeAll( async () => {
		page = await browser.newPage();
		testAccount = new TestAccount( accountName );
		editorPage = new EditorPage( page );

		await testAccount.authenticate( page );
		await testAccount.authenticateWpAdmin( page );
	} );

	it( 'Go to the new post page', async () => {
		await editorPage.visit( 'post' );
	} );

	it( 'Insert Pricing Table block', async () => {
		const blockHandle = await editorPage.addBlockFromSidebar(
			PricingTableBlock.blockName,
			PricingTableBlock.blockEditorSelector
		);
		pricingTableBlock = new PricingTableBlock( page, blockHandle );
	} );

	it( 'Open settings sidebar', async () => {
		await editorPage.openSettings();
	} );

	skipItIf( isAtomic )( 'Verify "None" gutter is available', async () => {
		await pricingTableBlock.setGutter( 'None' );
	} );

	it( 'Verify "Small" gutter is available', async () => {
		await pricingTableBlock.setGutter( 'Small' );
	} );

	it( 'Verify "Medium" gutter is available', async () => {
		await pricingTableBlock.setGutter( 'Medium' );
	} );

	it( 'Verify "Large" gutter is available', async () => {
		await pricingTableBlock.setGutter( 'Large' );
	} );

	skipItIf( isAtomic )( 'Verify "Huge" gutter is available', async () => {
		await pricingTableBlock.setGutter( 'Huge' );
	} );

	skipItIf( isSimple )( 'Verify "Custom" gutter is available', async () => {
		await pricingTableBlock.setGutter( 'Custom', 2.7 );
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

	skipItIf( isAtomic )( 'Verify the class for "Huge" gutter is present', async () => {
		await page.locator( '.wp-block-coblocks-pricing-table .has-huge-gutter' ).waitFor();
	} );

	skipItIf( isSimple )( 'Verify the proper value for "Custom" gutter is set', async () => {
		await page
			.locator( '.wp-block-coblocks-pricing-table [style="--coblocks-custom-gutter:2.7em"]' )
			.waitFor();
	} );
} );
