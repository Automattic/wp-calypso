import path from 'path';
import {
	setupHooks,
	DataHelper,
	MediaHelper,
	LoginFlow,
	NewPostFlow,
	GutenbergEditorPage,
	PricingTableBlock,
	DynamicHRBlock,
	HeroBlock,
	ClicktoTweetBlock,
	LogosBlock,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Blocks: CoBlocks' ), () => {
	let gutenbergEditorPage: GutenbergEditorPage;
	let pricingTableBlock: PricingTableBlock;
	let page: Page;

	// Test data
	const pricingTableBlockPrice = 888;
	const heroBlockHeading = 'Hero heading';
	const clicktoTweetBlockTweet =
		'The foolish man seeks happiness in the distance. The wise grows it under his feet. — James Oppenheim';
	const logoImage = MediaHelper.createTestImage();

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it( 'Log in', async function () {
		const loginFlow = new LoginFlow( page, 'gutenbergSimpleSiteUser' );
		await loginFlow.logIn();
	} );

	it( 'Start new post', async function () {
		const newPostFlow = new NewPostFlow( page );
		await newPostFlow.newPostFromNavbar();
		gutenbergEditorPage = new GutenbergEditorPage( page );
	} );

	it( 'Enter post title', async function () {
		await gutenbergEditorPage.enterTitle( DataHelper.randomPhrase() );
	} );

	it( `Insert ${ PricingTableBlock.blockName } block and enter price to left table`, async function () {
		const blockHandle = await gutenbergEditorPage.addBlock( PricingTableBlock.blockName );
		pricingTableBlock = new PricingTableBlock( blockHandle );
		await pricingTableBlock.enterPrice( 1, pricingTableBlockPrice );
	} );

	it( `Insert ${ DynamicHRBlock.blockName } block`, async function () {
		await gutenbergEditorPage.addBlock( DynamicHRBlock.blockName );
	} );

	it( `Insert ${ HeroBlock.blockName } block and enter heading`, async function () {
		const blockHandle = await gutenbergEditorPage.addBlock( HeroBlock.blockName );
		const heroBlock = new HeroBlock( blockHandle );
		await heroBlock.enterHeading( heroBlockHeading );
	} );

	it( `Insert ${ ClicktoTweetBlock.blockName } block and enter tweet content`, async function () {
		const blockHandle = await gutenbergEditorPage.addBlock( ClicktoTweetBlock.blockName );
		const clickToTweetBlock = new ClicktoTweetBlock( blockHandle );
		await clickToTweetBlock.enterTweetContent( clicktoTweetBlockTweet );
	} );

	it( `Insert ${ LogosBlock.blockName } block and set image`, async function () {
		const blockHandle = await gutenbergEditorPage.addBlock( LogosBlock.blockName );
		const logosBlock = new LogosBlock( blockHandle );
		await logosBlock.upload( logoImage );
	} );

	it( 'Publish and visit post', async function () {
		// Must save as draft first to bypass issue with post-publish panel being auto-dismissed when
		// ClickToTweet and Logos blocks are present.
		// See https://github.com/Automattic/wp-calypso/issues/54421.
		await gutenbergEditorPage.publish( { visit: true, saveDraft: true } );
	} );

	// Pass in a 1D array of values or text strings to validate each block.
	it.each`
		block                  | content
		${ PricingTableBlock } | ${ [ pricingTableBlockPrice ] }
		${ DynamicHRBlock }    | ${ null }
		${ HeroBlock }         | ${ [ heroBlockHeading ] }
		${ ClicktoTweetBlock } | ${ [ clicktoTweetBlockTweet ] }
		${ LogosBlock }        | ${ [ path.parse( logoImage ).name ] }
	`(
		`Confirm $block.blockName block is visible in published post`,
		async ( { block, content } ) => {
			// Pass the Block object class here then call the static method to validate.
			await block.validatePublishedContent( page, content );
		}
	);
} );
