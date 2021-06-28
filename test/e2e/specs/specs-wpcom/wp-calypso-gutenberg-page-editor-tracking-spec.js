/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import LoginFlow from '../../lib/flows/login-flow.js';

import GutenbergEditorComponent from '../../lib/gutenberg/gutenberg-editor-component';
import WPAdminSidebar from '../../lib/pages/wp-admin/wp-admin-sidebar';

import * as driverManager from '../../lib/driver-manager.js';
import * as driverHelper from '../../lib/driver-helper.js';
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

describe( `[${ host }] Calypso Gutenberg Page Editor Tracking: (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Tracking Page Editor: @parallel', function () {
		it( 'Can log in to WPAdmin and create new Page', async function () {
			const loginFlow = new LoginFlow( this.driver, host === 'WPCOM' ? gutenbergUser : undefined );
			await loginFlow.loginAndSelectWPAdmin();

			const wpAdminSidebar = await WPAdminSidebar.Expect( this.driver );
			await wpAdminSidebar.selectNewPage();

			const editor = await GutenbergEditorComponent.Expect( this.driver, 'wp-admin' );
			await editor.initEditor( { dismissPageTemplateLocator: true } );
		} );

		it( 'Tracks "from_template_selector" property for "wpcom_block_inserted"', async function () {
			// Reload for page layout selector.
			await this.driver.navigate().refresh();
			await driverHelper.dismissAlertIfPresent( this.driver );
			const editor = await GutenbergEditorComponent.Expect( this.driver, 'wp-admin' );
			await editor.initEditor();

			await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.page-pattern-modal .pattern-selector-item__label' )
			);

			const insertedEvents = await getEventsStack( this.driver ).filter(
				( event ) => event[ 0 ] === 'wpcom_block_inserted'
			);

			assert(
				insertedEvents.filter( ( event ) => event[ 1 ].from_template_selector === true ).length ===
					insertedEvents.length
			);
		} );

		createGeneralTests( { it, editorType: 'post', postType: 'page' } );

		afterEach( async function () {
			await clearEventsStack( this.driver );
		} );
	} );
} );
