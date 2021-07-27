import {
	setupHooks,
	DataHelper,
	LoginFlow,
	NewPostFlow,
	GutenbergEditorPage,
	PricingTableBlock,
	DynamicHRBlock,
	HeroBlock,
	ClicktoTweetBlock,
} from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'Gutenberg: CoBlocks' ), () => {
	let gutenbergEditorPage;
	let pricingTableBlock;
	let page;

	const pricingTableBlockPrice = 888;
	const heroBlockHeading = 'Hero heading';
	const clicktoTweetBlockTweet =
		'The foolish man seeks happiness in the distance. The wise grows it under his feet. — James Oppenheim';

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
		gutenbergEditorPage = await GutenbergEditorPage.Expect( page );
	} );

	it( 'Enter post title', async function () {
		await gutenbergEditorPage.enterTitle( DataHelper.randomPhrase() );
	} );

	it( `Insert ${ PricingTableBlock.name } block and enter price to left table`, async function () {
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

	it( 'Publish and visit post', async function () {
		await gutenbergEditorPage.publish( { visit: true } );
	} );

	it.each`
		block                  | content
		${ PricingTableBlock } | ${ [ pricingTableBlockPrice ] }
		${ DynamicHRBlock }    | ${ null }
		${ HeroBlock }         | ${ [ heroBlockHeading ] }
		${ ClicktoTweetBlock } | ${ [ clicktoTweetBlockTweet ] }
	`(
		`Confirm $block.blockName block is visible in published post`,
		async ( { block, content } ) => {
			// Passing in the actual object reference permits this call to succeed.
			// Calling `eval(blockName)` or `global[blockName]` does not work here.
			await block.validatePublishedContent( page, content );
		}
	);
} );
