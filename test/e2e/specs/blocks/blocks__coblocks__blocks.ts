/**
 * @group gutenberg
 */
import {
	envVariables,
	MediaHelper,
	EditorPage,
	TestFile,
	ClicktoTweetBlock,
	DynamicHRBlock,
	HeroBlock,
	LogosBlock,
	PricingTableBlock,
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
describe( 'CoBlocks: Blocks', function () {
	const accountName = getTestAccountByFeature( features );

	let page: Page;
	let testAccount: TestAccount;
	let editorPage: EditorPage;
	let pricingTableBlock: PricingTableBlock;
	let logoImage: TestFile;

	// Test data
	const pricingTableBlockPrices = [ 4.99, 9.99 ];
	const heroBlockHeading = 'Hero heading';
	const clicktoTweetBlockTweet = 'Tweet text';

	beforeAll( async () => {
		page = await browser.newPage();
		logoImage = await MediaHelper.createTestFile( TEST_IMAGE_PATH );
		testAccount = new TestAccount( accountName );
		editorPage = new EditorPage( page );

		await testAccount.authenticate( page );
	} );

	it( 'Go to the new post page', async () => {
		await editorPage.visit( 'post' );
	} );

	it( `Insert ${ PricingTableBlock.blockName } block and enter prices`, async function () {
		const blockHandle = await editorPage.addBlockFromSidebar(
			PricingTableBlock.blockName,
			PricingTableBlock.blockEditorSelector
		);
		pricingTableBlock = new PricingTableBlock( page, blockHandle );
		await pricingTableBlock.enterPrice( 1, pricingTableBlockPrices[ 0 ] );
		await pricingTableBlock.enterPrice( 2, pricingTableBlockPrices[ 1 ] );
	} );

	it( `Insert ${ DynamicHRBlock.blockName } block`, async function () {
		// Manual override of the Dyanmic HR/Separator block that comes with CoBlocks.
		// On AT, the block is called Dynamic Separator.
		// On Simple, the block is called Dynamic HR.
		// See: https://github.com/Automattic/wp-calypso/issues/75092
		if ( features.siteType === 'atomic' ) {
			await editorPage.addBlockFromSidebar(
				'Dynamic Separator',
				'[aria-label="Block: Dynamic Separator"]'
			);
		} else {
			await editorPage.addBlockFromSidebar(
				DynamicHRBlock.blockName,
				DynamicHRBlock.blockEditorSelector
			);
		}
	} );

	it( `Insert ${ HeroBlock.blockName } block and enter heading`, async function () {
		const blockHandle = await editorPage.addBlockFromSidebar(
			HeroBlock.blockName,
			HeroBlock.blockEditorSelector
		);
		const heroBlock = new HeroBlock( blockHandle );
		await heroBlock.enterHeading( heroBlockHeading );
	} );

	it( `Insert ${ ClicktoTweetBlock.blockName } block and enter tweet content`, async function () {
		const blockHandle = await editorPage.addBlockFromSidebar(
			ClicktoTweetBlock.blockName,
			ClicktoTweetBlock.blockEditorSelector
		);
		const clickToTweetBlock = new ClicktoTweetBlock( blockHandle );
		await clickToTweetBlock.enterTweetContent( clicktoTweetBlockTweet );
	} );

	it( `Insert ${ LogosBlock.blockName } block and set image`, async function () {
		const blockHandle = await editorPage.addBlockFromSidebar(
			LogosBlock.blockName,
			LogosBlock.blockEditorSelector
		);
		const logosBlock = new LogosBlock( blockHandle );
		await logosBlock.upload( logoImage.fullpath );
	} );

	it( 'Publish and visit the post', async function () {
		await editorPage.publish( { visit: true } );
	} );

	// Pass in a 1D array of values or text strings to validate each block.
	it.each`
		block                  | content
		${ PricingTableBlock } | ${ pricingTableBlockPrices }
		${ DynamicHRBlock }    | ${ null }
		${ HeroBlock }         | ${ [ heroBlockHeading ] }
		${ ClicktoTweetBlock } | ${ [ clicktoTweetBlockTweet ] }
	`(
		`Confirm $block.blockName block is visible in published post`,
		async ( { block, content } ) => {
			// Pass the Block object class here then call the static method to validate.
			await block.validatePublishedContent( page, content );
		}
	);

	it( `Confirm Logos block is visible in published post`, async () => {
		await LogosBlock.validatePublishedContent( page, [ logoImage.filename ] );
	} );
} );
