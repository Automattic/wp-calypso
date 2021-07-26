import assert from 'assert';
import config from 'config';
import * as dataHelper from '../../lib/data-helper';
import * as driverManager from '../../lib/driver-manager';
import LoginFlow from '../../lib/flows/login-flow.js';
import GutenbergEditorComponent from '../../lib/gutenberg/gutenberg-editor-component';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const gutenbergUser =
	process.env.GUTENBERG_EDGE === 'true' ? 'gutenbergSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';

describe( `[${ host }] Calypso Gutenberg Editor: Blocks (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Can see monetization blocks in block inserter @canary @parallel', function () {
		it( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( this.driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		it( 'Can see the Earn blocks', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			await gEditorComponent.openBlockInserterAndSearch( 'earn' );
			const shownItems = await gEditorComponent.getShownBlockInserterItems();

			[
				'Donations',
				'OpenTable',
				'Payments',
				'Pay with PayPal',
				'Pricing Table',
			].forEach( ( block ) =>
				assert.ok(
					shownItems.includes( block ),
					`Block inserter doesn't show the ${ block } block`
				)
			);

			await gEditorComponent.closeBlockInserter();
		} );

		it( 'Can see the Grow blocks', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			await gEditorComponent.openBlockInserterAndSearch( 'grow' );
			const shownItems = await gEditorComponent.getShownBlockInserterItems();

			[
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
			].forEach( ( block ) =>
				assert.ok(
					shownItems.includes( block ),
					`Block inserter doesn't show the ${ block } block`
				)
			);

			await gEditorComponent.closeBlockInserter();
		} );
	} );
} );
