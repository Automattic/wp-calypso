/**
 * @group gutenberg
 * @group coblocks
 */

import {
	setupHooks,
	DataHelper,
	MediaHelper,
	LoginPage,
	NewPostFlow,
	GutenbergEditorPage,
	PricingTableBlock,
	DynamicHRBlock,
	HeroBlock,
	ClicktoTweetBlock,
	LogosBlock,
	TestFile,
	BrowserHelper,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';
import { TEST_IMAGE_PATH } from '../constants';

describe( DataHelper.createSuiteTitle( 'CoBlocks Blocks' ), function () {
	let gutenbergEditorPage: GutenbergEditorPage;
	let pricingTableBlock: PricingTableBlock;
	let page: Page;
	let logoImage: TestFile;

	let user: string;
	if ( BrowserHelper.targetCoBlocksEdge() ) {
		user = 'coBlocksSimpleSiteEdgeUser';
	} else if ( BrowserHelper.targetGutenbergEdge() ) {
		user = 'gutenbergSimpleSiteEdgeUser';
	} else {
		user = 'gutenbergSimpleSiteUser';
	}

	// Test data
	const pricingTableBlockPrice = 888;
	const heroBlockHeading = 'Hero heading';
	const clicktoTweetBlockTweet =
		'The foolish man seeks happiness in the distance. The wise grows it under his feet. — James Oppenheim';

	setupHooks( ( args: { page: Page } ) => {
		page = args.page;
	} );

	beforeAll( async () => {
		logoImage = await MediaHelper.createTestFile( TEST_IMAGE_PATH );
	} );

	it( 'Log in', async function () {
		const loginPage = new LoginPage( page );
		await loginPage.login( { account: user } );
	} );

	it( 'Start new post', async function () {
		const newPostFlow = new NewPostFlow( page );
		await newPostFlow.newPostFromNavbar();
		gutenbergEditorPage = new GutenbergEditorPage( page );
	} );

	it( 'Enter post title', async function () {
		await gutenbergEditorPage.enterTitle( DataHelper.getRandomPhrase() );
	} );

	it( `Insert ${ PricingTableBlock.blockName } block and enter price to left table`, async function () {
		const blockHandle = await gutenbergEditorPage.addBlock(
			PricingTableBlock.blockName,
			PricingTableBlock.blockEditorSelector
		);
		pricingTableBlock = new PricingTableBlock( blockHandle );
		await pricingTableBlock.enterPrice( 1, pricingTableBlockPrice );
	} );

	it( `Insert ${ DynamicHRBlock.blockName } block`, async function () {
		await gutenbergEditorPage.addBlock(
			DynamicHRBlock.blockName,
			DynamicHRBlock.blockEditorSelector
		);
	} );

	it( `Insert ${ HeroBlock.blockName } block and enter heading`, async function () {
		const blockHandle = await gutenbergEditorPage.addBlock(
			HeroBlock.blockName,
			HeroBlock.blockEditorSelector
		);
		const heroBlock = new HeroBlock( blockHandle );
		await heroBlock.enterHeading( heroBlockHeading );
	} );

	it( `Insert ${ ClicktoTweetBlock.blockName } block and enter tweet content`, async function () {
		const blockHandle = await gutenbergEditorPage.addBlock(
			ClicktoTweetBlock.blockName,
			ClicktoTweetBlock.blockEditorSelector
		);
		const clickToTweetBlock = new ClicktoTweetBlock( blockHandle );
		await clickToTweetBlock.enterTweetContent( clicktoTweetBlockTweet );
	} );

	it( `Insert ${ LogosBlock.blockName } block and set image`, async function () {
		const blockHandle = await gutenbergEditorPage.addBlock(
			LogosBlock.blockName,
			LogosBlock.blockEditorSelector
		);
		const logosBlock = new LogosBlock( blockHandle );
		await logosBlock.upload( logoImage.fullpath );
	} );

	it( 'Publish and visit post', async function () {
		await gutenbergEditorPage.publish( { visit: true } );
	} );

	// Pass in a 1D array of values or text strings to validate each block.
	it.each`
		block                  | content
		${ PricingTableBlock } | ${ [ pricingTableBlockPrice ] }
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
