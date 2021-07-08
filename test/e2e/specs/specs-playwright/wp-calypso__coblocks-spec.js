/**
 * External dependencies
 */
import {
	DataHelper,
	LoginFlow,
	NewPostFlow,
	GutenbergEditorPage,
	PublishedPostPage,
	PricingTableBlock,
	DynamicHRBlock, //eslint-disable-line no-unused-vars
	HeroBlock, //eslint-disable-line no-unused-vars
} from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'Gutenberg: CoBlocks' ), function () {
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
		await PublishedPostPage.Expect( this.page );
	} );

	[ 'Pricing Table', 'Dynamic HR', 'Hero' ].forEach( function ( blockName ) {
		it( `Confirm ${ blockName } is visible in published post`, async function () {
			const blockClassName = `${ blockName.replace( /\s/g, '' ) }Block`;
			// eval() will allow us to call the static function of each block from
			// the string representation of the name.
			await eval( blockClassName ).validatePublishedContent( this.page );
		} );
	} );
} );
