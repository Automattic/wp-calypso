import {
	MediaHelper,
	EditorPage,
	TestFile,
	ClicktoTweetBlock,
	DynamicHRBlock,
	HeroBlock,
	LogosBlock,
	PricingTableBlock,
	envVariables,
	envToFeatureKey,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';
import { TEST_IMAGE_PATH } from '../constants';

test.describe( 'CoBlocks: Blocks', { tag: [ tags.GUTENBERG ] }, () => {
	test( 'As a user, I can add and configure CoBlocks blocks', async ( {
		page,
		accountGivenByEnvironment,
	} ) => {
		const features = envToFeatureKey( envVariables );
		// For this spec, all Atomic testing is always edge.
		// See https://github.com/Automattic/wp-calypso/pull/73052
		if ( envVariables.TEST_ON_ATOMIC ) {
			features.coblocks = 'edge';
		}

		let editorPage: EditorPage;
		let pricingTableBlock: PricingTableBlock;
		let logoImage: TestFile;

		// Test data
		const pricingTableBlockPrices = [ 4.99, 9.99 ];
		const heroBlockHeading = 'Hero heading';
		const clicktoTweetBlockTweet = 'Tweet text';

		await test.step( 'Given I have a test image file', async function () {
			logoImage = await MediaHelper.createTestFile( TEST_IMAGE_PATH );
		} );

		await test.step( `And I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async function () {
			await accountGivenByEnvironment.authenticate( page );
		} );

		await test.step( 'When I go to the new post page', async function () {
			editorPage = new EditorPage( page );
			await editorPage.visit( 'post' );
		} );

		await test.step( `And I insert ${ PricingTableBlock.blockName } block and enter prices`, async function () {
			const blockHandle = await editorPage.addBlockFromSidebar(
				PricingTableBlock.blockName,
				PricingTableBlock.blockEditorSelector
			);
			pricingTableBlock = new PricingTableBlock( page, blockHandle );
			await pricingTableBlock.enterPrice( 1, pricingTableBlockPrices[ 0 ] );
			await pricingTableBlock.enterPrice( 2, pricingTableBlockPrices[ 1 ] );
		} );

		await test.step( `And I insert ${ DynamicHRBlock.blockName } block`, async function () {
			// Manual override of the Dynamic HR/Separator block that comes with CoBlocks.
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

		await test.step( `And I insert ${ HeroBlock.blockName } block and enter heading`, async function () {
			const blockHandle = await editorPage.addBlockFromSidebar(
				HeroBlock.blockName,
				HeroBlock.blockEditorSelector
			);
			const heroBlock = new HeroBlock( blockHandle );
			await heroBlock.enterHeading( heroBlockHeading );
		} );

		await test.step( `And I insert ${ ClicktoTweetBlock.blockName } block and enter tweet content`, async function () {
			const blockHandle = await editorPage.addBlockFromSidebar(
				ClicktoTweetBlock.blockName,
				ClicktoTweetBlock.blockEditorSelector
			);
			const clickToTweetBlock = new ClicktoTweetBlock( blockHandle );
			await clickToTweetBlock.enterTweetContent( clicktoTweetBlockTweet );
		} );

		await test.step( `And I insert ${ LogosBlock.blockName } block and set image`, async function () {
			const blockHandle = await editorPage.addBlockFromSidebar(
				LogosBlock.blockName,
				LogosBlock.blockEditorSelector
			);
			const logosBlock = new LogosBlock( blockHandle );
			await logosBlock.upload( logoImage.fullpath );
		} );

		await test.step( 'And I publish and visit the post', async function () {
			await editorPage.publish( { visit: true } );
		} );

		await test.step( `Then ${ PricingTableBlock.blockName } block is visible in published post`, async function () {
			await PricingTableBlock.validatePublishedContent( page, pricingTableBlockPrices );
		} );

		await test.step( `And ${ DynamicHRBlock.blockName } block is visible in published post`, async function () {
			await DynamicHRBlock.validatePublishedContent( page );
		} );

		await test.step( `And ${ HeroBlock.blockName } block is visible in published post`, async function () {
			await HeroBlock.validatePublishedContent( page, [ heroBlockHeading ] );
		} );

		await test.step( `And ${ ClicktoTweetBlock.blockName } block is visible in published post`, async function () {
			await ClicktoTweetBlock.validatePublishedContent( page, [ clicktoTweetBlockTweet ] );
		} );

		await test.step( `And ${ LogosBlock.blockName } block is visible in published post`, async function () {
			await LogosBlock.validatePublishedContent( page, [ logoImage.filename ] );
		} );
	} );
} );
