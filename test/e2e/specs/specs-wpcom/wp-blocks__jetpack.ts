/**
 * @group gutenberg
 */
import {
	setupHooks,
	BrowserHelper,
	DataHelper,
	GutenbergEditorPage,
	NewPostFlow,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

let user: string;
if ( BrowserHelper.targetGutenbergEdge() ) {
	user = 'gutenbergSimpleSiteEdgeUser';
} else {
	user = 'gutenbergSimpleSiteUser';
}

describe( DataHelper.createSuiteTitle( 'Blocks: Jetpack Earn/Grow' ), function () {
	let page: Page;
	let gutenbergEditorPage: GutenbergEditorPage;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	beforeAll( async function () {
		gutenbergEditorPage = await new NewPostFlow( page ).startImmediately( user );
		await gutenbergEditorPage.openBlockInserter();
	} );

	it.each( [ 'Donations', 'OpenTable', 'Payments', 'Pay with PayPal', 'Pricing Table' ] )(
		'Earn: %s block exists in block inserter',
		async function ( blockName ) {
			await gutenbergEditorPage.searchBlockInserter( blockName );
			const result = await gutenbergEditorPage.validateBlockShownInResult( blockName );
			expect( result ).toEqual( true );
		}
	);

	it.each( [
		'Business Hours',
		'Calendly',
		'Form',
		'Contact Info',
		'Mailchimp',
		'Revue',
		'Subscription Form',
		'Premium Content',
		'Click to Tweet',
		'Logos',
		'Contact Form',
		'RSVP Form',
		'Registration Form',
		'Appointment Form',
		'Feedback Form',
		'WhatsApp Button',
	] )( 'Grow: %s block exists in block inserter', async function ( blockName ) {
		await gutenbergEditorPage.searchBlockInserter( blockName );
		const result = await gutenbergEditorPage.validateBlockShownInResult( blockName );
		expect( result ).toEqual( true );
	} );
} );
