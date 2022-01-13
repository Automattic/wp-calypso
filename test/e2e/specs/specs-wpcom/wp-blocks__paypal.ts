/**
 * @group gutenberg
 */
import {
	setupHooks,
	BrowserHelper,
	DataHelper,
	GutenbergEditorPage,
	NewPostFlow,
	PayWithPaypalBlock,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

let user: string;
if ( BrowserHelper.targetGutenbergEdge() ) {
	user = 'gutenbergSimpleSiteEdgeUser';
} else {
	user = 'gutenbergSimpleSiteUser';
}

describe( DataHelper.createSuiteTitle( 'Blocks: Pay with Paypal' ), function () {
	const title = `Pay with Paypal block - ${ DataHelper.getTimestamp() }`;
	const paymentDetails = {
		name: 'Test Button',
		currency: 'JPY',
		price: 900,
		email: 'test@wordpress.com',
	};

	let popup: Page;
	let page: Page;
	let gutenbergEditorPage: GutenbergEditorPage;
	let payWithPaypalBlock: PayWithPaypalBlock;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	beforeAll( async function () {
		gutenbergEditorPage = await new NewPostFlow( page ).startImmediately( user );
	} );

	it( 'Enter post title', async function () {
		gutenbergEditorPage = new GutenbergEditorPage( page );
		await gutenbergEditorPage.enterTitle( title );
	} );

	it( 'Insert Pay with Paypal block', async function () {
		const blockHandle = await gutenbergEditorPage.addBlock(
			PayWithPaypalBlock.blockName,
			PayWithPaypalBlock.blockEditorSelector
		);
		payWithPaypalBlock = new PayWithPaypalBlock( blockHandle );
	} );

	it( 'Set Paypal details', async function () {
		await payWithPaypalBlock.setPaymentDetails( paymentDetails );
	} );

	it( 'Publish post', async function () {
		// If the post is not saved as draft, the Pay with Paypal block is not rendered
		// in the published post.
		await gutenbergEditorPage.saveDraft();
		// Leave site? popup cannot be prevented.
		// See https://github.com/Automattic/wp-calypso/issues/60014.
		await gutenbergEditorPage.publish( { visit: true } );
	} );

	it( 'Pay with Paypal block is visible in published post', async function () {
		await PayWithPaypalBlock.validatePublishedContent( page, [
			paymentDetails.name,
			paymentDetails.price,
		] );
	} );

	it( 'Click on Paypal button', async function () {
		[ popup ] = await Promise.all( [
			page.waitForEvent( 'popup' ),
			PayWithPaypalBlock.clickPaymentButton( page, 'PayPal' ),
		] );

		await popup.waitForSelector( '[data-title="Log in to your PayPal account"]' );
	} );

	it( 'Post has PayPal overlay applied', async function () {
		await page.waitForSelector( 'iframe[title="PayPal Checkout Overlay"]' );
	} );

	it( 'PayPal overlay is removed upon popup closure', async function () {
		await popup.close();
		await page.waitForSelector( 'iframe[title="PayPal Checkout Overlay"]', { state: 'detached' } );
	} );
} );
