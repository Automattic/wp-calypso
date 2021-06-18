/**
 * External dependencies
 */
import config from 'config';
import assert from 'assert';

/**
 * Internal dependencies
 */
import LoginFlow from '../../lib/flows/login-flow.js';

import WPAdminSidebar from '../../lib/pages/wp-admin/wp-admin-sidebar';
import GutenbergEditorComponent from '../../lib/gutenberg/gutenberg-editor-component.js';

import * as driverManager from '../../lib/driver-manager.js';
import * as dataHelper from '../../lib/data-helper.js';
import { clearEventsStack, getEventsStack } from '../../lib/gutenberg/tracking/utils.js';
import { createGeneralTests } from '../../lib/gutenberg/tracking/general-tests.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

// We need to trigger test runs against Gutenberg Edge (the "next" version of Gutenberg that
// will be deployed to Dotcom) as well as the current version of Gutenberg.
const gutenbergUser =
	process.env.GUTENBERG_EDGE === 'true' ? 'gutenbergSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';

describe( `[${ host }] Calypso Gutenberg Post Editor Tracking: (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Tracking Post Editor: @parallel', function () {
		it( 'Can log in to WPAdmin and create new Post', async function () {
			const loginFlow = new LoginFlow( this.driver, host === 'WPCOM' ? gutenbergUser : undefined );
			await loginFlow.loginAndSelectWPAdmin();

			const wpAdminSidebar = await WPAdminSidebar.Expect( this.driver );
			await wpAdminSidebar.selectNewPost();
		} );

		createGeneralTests( {
			it,
			editorType: 'post',
			postType: 'post',
		} );

		it( 'Tracks "wpcom_block_editor_details_click" event', async function () {
			const editor = await GutenbergEditorComponent.Expect( this.driver, 'wp-admin' );

			await editor.toggleDetails(); // Open details
			await editor.toggleDetails(); // Close details

			const eventsStack = await getEventsStack( this.driver );
			const toggleEvents = eventsStack.filter(
				( [ eventName ] ) => eventName === 'wpcom_block_editor_details_click'
			);
			assert.strictEqual( toggleEvents.length, 1 );
		} );

		afterEach( clearEventsStack );
	} );
} );
