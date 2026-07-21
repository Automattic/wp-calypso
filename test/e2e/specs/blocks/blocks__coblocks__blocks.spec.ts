import {
	ClicktoTweetBlock,
	DynamicHRBlock,
	HeroBlock,
	LogosBlock,
	MediaHelper,
	PricingTableBlock,
	TestAccount,
	TestFile,
	envVariables,
	envToFeatureKey,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';
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
test.describe( 'CoBlocks: Blocks', { tag: [ tags.GUTENBERG ] }, () => {
	const accountName = getTestAccountByFeature( features );

	// Test data
	const pricingTableBlockPrices = [ 4.99, 9.99 ];
	const heroBlockHeading = 'Hero heading';
	const clicktoTweetBlockTweet = 'Tweet text';

	test( 'As a user, I can use CoBlocks in a post', async ( { page, pageEditor } ) => {
		let pricingTableBlock: PricingTableBlock;
		let logoImage: TestFile;

		await test.step( 'Given I am authenticated', async () => {
			logoImage = await MediaHelper.createTestFile( TEST_IMAGE_PATH );
			const testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );
		} );

		await test.step( 'When I go to the new post page', async () => {
			const testAccount = new TestAccount( accountName );
			const siteSlug = testAccount.getSiteURL( { protocol: false } );
			await pageEditor.visit( 'post', { siteSlug } );
		} );

		await test.step( `When I insert ${ PricingTableBlock.blockName } block and enter prices`, async () => {
			const blockHandle = await pageEditor.addBlockFromSidebar(
				PricingTableBlock.blockName,
				PricingTableBlock.blockEditorSelector
			);
			pricingTableBlock = new PricingTableBlock( page, blockHandle );
			await pricingTableBlock.enterPrice( 1, pricingTableBlockPrices[ 0 ] );
			await pricingTableBlock.enterPrice( 2, pricingTableBlockPrices[ 1 ] );
		} );

		await test.step( `When I insert ${ DynamicHRBlock.blockName } block`, async () => {
			// Manual override of the Dynamic HR/Separator block that comes with CoBlocks.
			// On AT, the block is called Dynamic Separator.
			// On Simple, the block is called Dynamic HR.
			// See: https://github.com/Automattic/wp-calypso/issues/75092
			if ( features.siteType === 'atomic' ) {
				await pageEditor.addBlockFromSidebar(
					'Dynamic Separator',
					'[aria-label="Block: Dynamic Separator"]'
				);
			} else {
				await pageEditor.addBlockFromSidebar(
					DynamicHRBlock.blockName,
					DynamicHRBlock.blockEditorSelector
				);
			}
		} );

		await test.step( `When I insert ${ HeroBlock.blockName } block and enter heading`, async () => {
			const blockHandle = await pageEditor.addBlockFromSidebar(
				HeroBlock.blockName,
				HeroBlock.blockEditorSelector
			);
			const heroBlock = new HeroBlock( blockHandle );
			await heroBlock.enterHeading( heroBlockHeading );
		} );

		await test.step( `When I insert ${ ClicktoTweetBlock.blockName } block and enter tweet content`, async () => {
			const blockHandle = await pageEditor.addBlockFromSidebar(
				ClicktoTweetBlock.blockName,
				ClicktoTweetBlock.blockEditorSelector
			);
			const clickToTweetBlock = new ClicktoTweetBlock( blockHandle );
			await clickToTweetBlock.enterTweetContent( clicktoTweetBlockTweet );
		} );

		await test.step( `When I insert ${ LogosBlock.blockName } block and set image`, async () => {
			const blockHandle = await pageEditor.addBlockFromSidebar(
				LogosBlock.blockName,
				LogosBlock.blockEditorSelector
			);
			const logosBlock = new LogosBlock( blockHandle );
			await logosBlock.upload( logoImage!.fullpath );
		} );

		await test.step( 'When I publish and visit the post', async () => {
			await pageEditor.publish( { visit: true } );
		} );

		for ( const [ BlockClass, content ] of [
			[ PricingTableBlock, pricingTableBlockPrices ],
			[ DynamicHRBlock, null ],
			[ HeroBlock, [ heroBlockHeading ] ],
			[ ClicktoTweetBlock, [ clicktoTweetBlockTweet ] ],
		] as const ) {
			await test.step( `Then ${ BlockClass.blockName } block is visible in published post`, async () => {
				await BlockClass.validatePublishedContent( page, content as never );
			} );
		}

		await test.step( 'Then Logos block is visible in published post', async () => {
			await LogosBlock.validatePublishedContent( page, [ logoImage!.filename ] );
		} );

		void expect;
	} );
} );
