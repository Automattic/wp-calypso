/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../../lib/flows/login-flow.js';

import GutenbergEditorComponent from '../../lib/gutenberg/gutenberg-editor-component';

import * as driverManager from '../../lib/driver-manager';
import * as dataHelper from '../../lib/data-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const gutenbergUser =
	process.env.GUTENBERG_EDGE === 'true' ? 'gutenbergSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';

describe( `[${ host }] Calypso Gutenberg Editor: Blocks (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );
	const driver = global.__BROWSER__;

	describe( 'Can see monetization blocks in block inserter @canary @parallel', function () {
		it( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		it( 'Can see the Earn blocks', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
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
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
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
