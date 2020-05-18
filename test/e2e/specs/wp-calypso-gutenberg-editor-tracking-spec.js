/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow.js';

import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component';
import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar';

import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

const gutenbergUser =
	process.env.GUTENBERG_EDGE === 'true' ? 'gutenbergSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Calypso Gutenberg Tracking: (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Tracking: @parallel', function () {
		// Create image file for upload
		before( async function () {} );

		step( 'Can log in to WPAdmin and create new Post', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			if ( host !== 'WPCOM' ) {
				this.loginFlow = new LoginFlow( driver );
			}
			// await this.loginFlow.loginAndStartNewPage();

			await this.loginFlow.loginAndSelectWPAdmin();

			//Wait for the new window or tab
			await driver.wait( async () => ( await driver.getAllWindowHandles() ).length === 2, 10000 );

			//Loop through until we find a new window handle
			const windows = await driver.getAllWindowHandles();

			await driver.switchTo().window( windows[ 1 ] );

			const wpadminSidebarComponent = await WPAdminSidebar.Expect( driver );
			await wpadminSidebarComponent.selectNewPost();
		} );

		step( 'Tracks "wpcom_block_inserted" event', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver, 'wp-admin' );

			// Insert some Blocks
			await gEditorComponent.addBlock( 'Markdown' );
			await gEditorComponent.addBlock( 'Columns' );
			await gEditorComponent.addBlock( 'Columns' );

			// Grab the events stack (only present on e2e test envs).
			// see: https://github.com/Automattic/wp-calypso/pull/41329
			const eventsStack = await driver.executeScript( `return window._e2eEventsStack;` );

			// Assert that Insertion Events were tracked.
			assert.strictEqual(
				eventsStack.some(
					( [ eventName, eventData ] ) =>
						eventName === 'wpcom_block_inserted' && eventData.block_name === 'core/columns'
				),
				true,
				`"wpcom_block_inserted" event failed to fire for ${ eventsStack[ 0 ][ 1 ].block_name }`
			);
		} );

		after( async function () {} );
	} );
} );
