/**
 * External dependencies
 */
import config from 'config';
import assert from 'assert';

/**
 * Internal dependencies
 */
import LoginFlow from '../../lib/flows/login-flow.js';

import SidebarComponent from '../../lib/components/sidebar-component.js';
import SiteEditorPage from '../../lib/pages/site-editor-page.js';
import SiteEditorComponent from '../../lib/components/site-editor-component.js';

import * as driverManager from '../../lib/driver-manager.js';
import * as driverHelper from '../../lib/driver-helper.js';
import * as dataHelper from '../../lib/data-helper.js';
import { clearEventsStack, getEventsStack } from '../../lib/gutenberg/tracking/utils.js';
import { createGeneralTests } from '../../lib/gutenberg/tracking/general-tests.js';
import { By } from 'selenium-webdriver';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

const siteEditorUser = 'siteEditorSimpleSiteUser';

describe( `[${ host }] Calypso Gutenberg Site Editor Tracking: (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	// TODO: Create an edge user with a Site Editor enabled site
	before( async function () {
		if ( process.env.GUTENBERG_EDGE === 'true' ) {
			this.skip();
		}
	} );

	describe( 'Tracking Site Editor: @parallel', function () {
		it( 'Log in with site editor user and Site Editor opens successfully', async function () {
			const loginFlow = new LoginFlow( this.driver, host === 'WPCOM' ? siteEditorUser : undefined );
			await loginFlow.loginAndSelectMySite();

			const sidebar = await SidebarComponent.Expect( this.driver );
			await sidebar.selectSiteEditor();

			// Wait until Site Editor page is loaded
			await SiteEditorPage.Expect( this.driver );

			const editor = await SiteEditorComponent.Expect( this.driver );
			await editor.waitForTemplateToLoad();
			await editor.waitForTemplatePartsToLoad();
		} );

		createGeneralTests( { it, editorType: 'site' } );

		describe( 'Tracks "wpcom_block_editor_global_styles_tab_selected', function () {
			it( 'when Global Styles sidebar is opened', async function () {
				await driverHelper.clickWhenClickable(
					this.driver,
					By.css( '.edit-site-header__actions button[aria-label="Global Styles"]' )
				);

				const eventsStack = await getEventsStack( this.driver );
				const tabSelectedEvents = eventsStack.filter(
					( [ eventName ] ) => eventName === 'wpcom_block_editor_global_styles_tab_selected'
				);
				assert.strictEqual( tabSelectedEvents.length, 1 );
				const [ , eventData ] = tabSelectedEvents[ 0 ];
				assert.strictEqual( eventData.tab, 'root' );
				assert.strictEqual( eventData.open, true );
			} );

			it( 'when Global Styles sidebar is closed', async function () {
				// Note the sidebar is already open here because of the previous test.
				await driverHelper.clickWhenClickable(
					this.driver,
					By.css( '.edit-site-header__actions button[aria-label="Global Styles"]' )
				);

				const eventsStack = await getEventsStack( this.driver );
				const tabSelectedEvents = eventsStack.filter(
					( [ eventName ] ) => eventName === 'wpcom_block_editor_global_styles_tab_selected'
				);
				assert.strictEqual( tabSelectedEvents.length, 1 );
				const [ , eventData ] = tabSelectedEvents[ 0 ];
				assert.strictEqual( eventData.tab, 'root' );
				assert.strictEqual( eventData.open, false );
			} );

			it( 'when Global Styles sidebar is closed by opening another sidebar', async function () {
				await driverHelper.clickWhenClickable(
					this.driver,
					By.css( '.edit-site-header__actions button[aria-label="Global Styles"]' )
				);
				await driverHelper.clickWhenClickable(
					this.driver,
					By.css( '.edit-site-header__actions button[aria-label="Settings"]' )
				);

				const eventsStack = await getEventsStack( this.driver );
				const tabSelectedEvents = eventsStack.filter(
					( [ eventName ] ) => eventName === 'wpcom_block_editor_global_styles_tab_selected'
				);
				assert.strictEqual( tabSelectedEvents.length, 2 );
				const [ , eventData ] = tabSelectedEvents[ 0 ];
				assert.strictEqual( eventData.tab, 'root' );
				assert.strictEqual( eventData.open, false );
			} );

			it( 'when tab is changed in Global Styles sidebar', async function () {
				await driverHelper.clickWhenClickable(
					this.driver,
					By.css( '.edit-site-header__actions button[aria-label="Global Styles"]' )
				);
				await driverHelper.clickWhenClickable(
					this.driver,
					By.css(
						'.edit-site-global-styles-sidebar .components-tab-panel__tabs button:nth-child(2)'
					)
				);
				await driverHelper.clickWhenClickable(
					this.driver,
					By.css(
						'.edit-site-global-styles-sidebar .components-tab-panel__tabs button:nth-child(1)'
					)
				);

				const eventsStack = await getEventsStack( this.driver );
				const tabSelectedEvents = eventsStack.filter(
					( [ eventName ] ) => eventName === 'wpcom_block_editor_global_styles_tab_selected'
				);
				assert.strictEqual( tabSelectedEvents.length, 3 );
				const [ , blockTypeSelectedEventData ] = tabSelectedEvents[ 1 ];
				assert.strictEqual( blockTypeSelectedEventData.tab, 'block-type' );
				assert.strictEqual( blockTypeSelectedEventData.open, true );
				const [ , rootSelectedEventData ] = tabSelectedEvents[ 2 ];
				assert.strictEqual( rootSelectedEventData.tab, 'root' );
				assert.strictEqual( rootSelectedEventData.open, true );
			} );

			it( 'should not trigger the event when clicking on the already active tab', async function () {
				await driverHelper.clickWhenClickable(
					this.driver,
					By.css(
						'.edit-site-global-styles-sidebar .components-tab-panel__tabs button:nth-child(1)'
					)
				);
				await driverHelper.clickWhenClickable(
					this.driver,
					By.css(
						'.edit-site-global-styles-sidebar .components-tab-panel__tabs button:nth-child(1)'
					)
				);
				await driverHelper.clickWhenClickable(
					this.driver,
					By.css(
						'.edit-site-global-styles-sidebar .components-tab-panel__tabs button:nth-child(1)'
					)
				);

				const eventsStack = await getEventsStack( this.driver );
				const tabSelectedEvents = eventsStack.filter(
					( [ eventName ] ) => eventName === 'wpcom_block_editor_global_styles_tab_selected'
				);
				assert.strictEqual( tabSelectedEvents.length, 0 );
			} );
		} );

		afterEach( clearEventsStack );
	} );
} );
