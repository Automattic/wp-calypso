/**
 * External dependencies
 */
import {
	DataHelper,
	LoginFlow,
	NewPostFlow,
	GutenbergEditorPage,
	PricingTableBlock,
} from '@automattic/calypso-e2e';
import assert from 'assert';

describe( DataHelper.createSuiteTitle( 'WPCOM-specific gutter controls' ), function () {
	const blockName = 'Pricing Table';
	const gutters = [ 'None', 'Small', 'Medium', 'Large', 'Huge' ];
	let gutenbergEditorPage;
	let pricingTableBlock;

	it( 'Log in', async function () {
		const loginFlow = new LoginFlow( this.page, 'gutenbergSimpleSiteUser' );
		await loginFlow.logIn();
	} );

	it( 'Start new post', async function () {
		const newPostFlow = new NewPostFlow( this.page );
		await newPostFlow.newPostFromNavbar();
		gutenbergEditorPage = await GutenbergEditorPage.Expect( this.page );
	} );

	it( 'Open settings sidebar', async function () {
		await gutenbergEditorPage.openSettings();
	} );

	it( 'Insert Pricing Table block', async function () {
		const blockHandle = await gutenbergEditorPage.addBlock( blockName );
		pricingTableBlock = new PricingTableBlock( blockHandle );
	} );

	gutters.forEach( async function ( gutterValue ) {
		it( `Set gutter value to ${ gutterValue }`, async function () {
			const isSelected = await pricingTableBlock.setGutter( gutterValue );
			assert.strictEqual( isSelected, true );
		} );
	} );
} );
