import {
	setupHooks,
	DataHelper,
	LoginFlow,
	NewPostFlow,
	GutenbergEditorPage,
	PublishedPostPage,
	PricingTableBlock,
	DynamicHRBlock,
	HeroBlock,
} from '@automattic/calypso-e2e';

describe.only( DataHelper.createSuiteTitle( 'Gutenberg: CoBlocks' ), () => {
	let gutenbergEditorPage;
	let pricingTableBlock;
	let page;

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

	it( 'Insert Pricing Table block and enter price to left table', async function () {
		const blockHandle = await gutenbergEditorPage.addBlock( 'Pricing Table' );
		pricingTableBlock = new PricingTableBlock( blockHandle );
		const price = 888;
		await pricingTableBlock.enterPrice( 'left', price );
	} );

	it( 'Insert Dynamic HR block', async function () {
		await gutenbergEditorPage.addBlock( 'Dynamic HR' );
	} );

	it( 'Insert Hero block', async function () {
		await gutenbergEditorPage.addBlock( 'Hero' );
	} );

	it( 'Publish and visit post', async function () {
		await gutenbergEditorPage.publish( { visit: true } );
		await PublishedPostPage.Expect( page );
	} );

	it.each`
		block                  | name
		${ PricingTableBlock } | ${ 'Pricing Table' }
		${ DynamicHRBlock }    | ${ 'Dynamic HR' }
		${ HeroBlock }         | ${ 'Hero' }
	`( `Confirm $name block is visible in published post`, async ( { block } ) => {
		// Passing in the actual object reference permits this call to succeed.
		// Calling `eval(objName)` or `global[objName]` leads to failure.
		await block.validatePublishedContent( page );
	} );
} );
