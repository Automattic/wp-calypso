import assert from 'assert';
import {
	setupHooks,
	DataHelper,
	LoginFlow,
	NewPostFlow,
	GutenbergEditorPage,
	PricingTableBlock,
} from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'WPCOM-specific gutter controls' ), () => {
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

	it( 'Open settings sidebar', async function () {
		await gutenbergEditorPage.openSettings();
	} );

	it( 'Insert Pricing Table block', async function () {
		const blockHandle = await gutenbergEditorPage.addBlock( 'Pricing Table' );
		pricingTableBlock = new PricingTableBlock( blockHandle );
	} );

	it.each`
		gutterValue
		${ 'None' }
		${ 'Small' }
		${ 'Medium' }
		${ 'Large' }
		${ 'Huge' }
	`( 'Set gutter value to $gutterValue', async ( { gutterValue } ) => {
		const isSelected = await pricingTableBlock.setGutter( gutterValue );
		assert.strictEqual( isSelected, true );
	} );
} );
