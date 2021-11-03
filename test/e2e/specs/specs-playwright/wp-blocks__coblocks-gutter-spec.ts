/**
 * @group gutenberg
 */

import {
	setupHooks,
	DataHelper,
	LoginPage,
	NewPostFlow,
	GutenbergEditorPage,
	PricingTableBlock,
	BrowserHelper,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'WPCOM-specific gutter controls' ), () => {
	let gutenbergEditorPage: GutenbergEditorPage;
	let pricingTableBlock: PricingTableBlock;
	let page: Page;

	let user: string;
	if ( BrowserHelper.targetCoBlocksEdge() ) {
		user = 'coBlocksSimpleSiteEdgeUser';
	} else if ( BrowserHelper.targetGutenbergEdge() ) {
		user = 'gutenbergSimpleSiteEdgeUser';
	} else {
		user = 'gutenbergSimpleSiteUser';
	}

	setupHooks( ( args ) => {
		page = args.page;
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

	it( 'Insert Pricing Table block', async function () {
		const blockHandle = await gutenbergEditorPage.addBlock(
			PricingTableBlock.blockName,
			PricingTableBlock.blockEditorSelector
		);
		pricingTableBlock = new PricingTableBlock( blockHandle );
	} );

	it( 'Open settings sidebar', async function () {
		await gutenbergEditorPage.openSettings();
	} );

	it.each( PricingTableBlock.gutterValues )( 'Set gutter value to %s', async ( value ) => {
		await pricingTableBlock.setGutter( value );
	} );
} );
