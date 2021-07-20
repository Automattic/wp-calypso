import assert from 'assert';
import config from 'config';
import { By, Key } from 'selenium-webdriver';
import SidebarComponent from '../../lib/components/sidebar-component.js';
import SiteEditorComponent from '../../lib/components/site-editor-component.js';
import * as dataHelper from '../../lib/data-helper.js';
import * as driverHelper from '../../lib/driver-helper.js';
import * as driverManager from '../../lib/driver-manager.js';
import LoginFlow from '../../lib/flows/login-flow.js';
import { createGeneralTests } from '../../lib/gutenberg/tracking/general-tests.js';
import { clearEventsStack, getEventsStack } from '../../lib/gutenberg/tracking/utils.js';
import SiteEditorPage from '../../lib/pages/site-editor-page.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

const siteEditorUser = 'siteEditorSimpleSiteUser';

const navigationSidebarBackToRoot = async ( driver ) => {
	const backButtonLocator = By.css(
		'.components-navigation__back-button:not(.edit-site-navigation-panel__back-to-dashboard)'
	);

	while ( await driverHelper.isElementEventuallyLocatedAndVisible( driver, backButtonLocator ) ) {
		await driverHelper.clickWhenClickable( driver, backButtonLocator );
	}
};

const clickGlobalStylesButton = async ( driver ) =>
	await driverHelper.clickWhenClickable(
		driver,
		By.css( '.edit-site-header__actions button[aria-label="Global Styles"]' )
	);

const clickGlobalStylesResetButton = async ( driver ) => {
	await driverHelper.clickIfPresent(
		driver,
		By.css(
			'.edit-site-global-styles-sidebar .edit-site-global-styles-sidebar__reset-button:enabled'
		)
	);
};

const clickGlobalStylesBlockPanel = async ( driver, name ) => {
	const locator = driverHelper.createTextLocator(
		By.css( '.edit-site-global-styles-sidebar .components-panel__body button' ),
		name
	);
	await driverHelper.clickWhenClickable( driver, locator );
};

const changeGlobalStylesFontSize = async ( driver, value ) =>
	await driverHelper.setWhenSettable(
		driver,
		By.css( '.edit-site-global-styles-sidebar .components-font-size-picker input' ),
		value
	);

const changeGlobalStylesColor = async ( driver, colorTypeIndex, colorValueIndex ) =>
	await driverHelper.clickWhenClickable(
		driver,
		By.css(
			`.edit-site-global-styles-sidebar .block-editor-color-gradient-control:nth-of-type(${ colorTypeIndex }) .components-circular-option-picker__option-wrapper:nth-of-type(${ colorValueIndex }) .components-circular-option-picker__option`
		)
	);

const changeGlobalStylesFirstColorPaletteItem = async ( driver, value, pickerOpened = false ) => {
	if ( ! pickerOpened ) {
		await driverHelper.clickWhenClickable(
			driver,
			By.css(
				'.edit-site-global-styles-sidebar .components-base-control:last-of-type .components-color-edit__color-option button'
			)
		);
	}

	await driverHelper.setWhenSettable( driver, By.css( '.components-color-picker input' ), value );
};

const deleteCustomEntities = async function ( driver, entityName ) {
	await SiteEditorComponent.Expect( driver );
	const getAndDeleteEntities = async ( name ) => {
		const entities = window.wp.data
			.select( 'core' )
			.getEntityRecords( 'postType', name, {
				per_page: -1,
			} )
			.filter( ( item ) => item.source === 'custom' );
		for ( const entity of entities ) {
			await window.wp.data.dispatch( 'core' ).deleteEntityRecord( 'postType', name, entity.id );
		}
	};
	await driver.executeScript( getAndDeleteEntities, entityName );
};

const deleteTemplatesAndTemplateParts = async function ( driver ) {
	await deleteCustomEntities( driver, 'wp_template' );
	await deleteCustomEntities( driver, 'wp_template_part' );
};

const clickBlockSettingsButton = async ( driver ) =>
	await driverHelper.clickWhenClickable(
		driver,
		By.css( '.edit-site-header__actions button[aria-label="Settings"]' )
	);

const clickNthTabInGlobalStylesSidebar = async ( driver, tabIndex ) =>
	await driverHelper.clickWhenClickable(
		driver,
		By.css(
			`.edit-site-global-styles-sidebar .components-tab-panel__tabs button:nth-child(${ tabIndex })`
		)
	);

const clickGlobalStylesRootTab = async ( driver ) =>
	await clickNthTabInGlobalStylesSidebar( driver, 1 );

const clickGlobalStylesBlockTypeTab = async ( driver ) =>
	await clickNthTabInGlobalStylesSidebar( driver, 2 );

const getGlobalStylesTabSelectedEvents = async ( driver ) => {
	const eventsStack = await getEventsStack( driver );
	return eventsStack.filter(
		( [ eventName ] ) => eventName === 'wpcom_block_editor_global_styles_tab_selected'
	);
};

const getGlobalStylesUpdateEvents = async ( driver ) => {
	const eventsStack = await getEventsStack( driver );
	return eventsStack.filter(
		( [ eventName ] ) => eventName === 'wpcom_block_editor_global_styles_update'
	);
};

const saveGlobalStyles = async ( driver ) => {
	await driverHelper.clickWhenClickable( driver, By.css( '.edit-site-save-button__button' ) );
	const allCheckboxes = await driver.findElements(
		By.css( '.entities-saved-states__panel .components-checkbox-control__input' )
	);
	for ( const checkbox of allCheckboxes ) {
		await driverHelper.setCheckbox( driver, () => checkbox, false );
	}
	const locator = driverHelper.createTextLocator(
		By.css( '.entities-saved-states__panel .components-checkbox-control__label' ),
		'Custom Styles'
	);
	await driverHelper.clickWhenClickable( driver, locator );
	await driverHelper.clickWhenClickable(
		driver,
		By.css( '.editor-entities-saved-states__save-button' )
	);
	// Ensure there is enough time for the debounced function to run, and get/compare entities to
	// create the track event.
	await driver.sleep( 500 );
};

const testGlobalStylesColorAndTypography = async ( driver, blocksLevel = false ) => {
	if ( blocksLevel ) {
		await clickGlobalStylesBlockTypeTab( driver );
		await clickGlobalStylesBlockPanel( driver, 'Button' );
	}

	await changeGlobalStylesFontSize( driver, '11' );
	// Update events are debounced to avoid event spam when items are updated using
	// slider inputs. Therefore we must wait so this update event is not debounced.
	await driver.sleep( 100 );

	// Update text color option.
	await changeGlobalStylesColor( driver, 1, 1 );
	await driver.sleep( 100 );

	if ( blocksLevel ) {
		await clickGlobalStylesBlockPanel( driver, 'Button' );
		await clickGlobalStylesBlockPanel( driver, 'Column' );
	}

	// Update link color option.
	await changeGlobalStylesColor( driver, 3, 2 );
	// The last sleep before accessing the event stack must be longer to ensure there is
	// enough time for the function to retrieve entities and compare.
	await driver.sleep( 500 );

	let updateEvents = await getGlobalStylesUpdateEvents( driver );

	assert.strictEqual( updateEvents.length, 3 );
	assert(
		updateEvents.some( ( event ) => {
			const { block_type, section, field, field_value, element_type, palette_slug } = event[ 1 ];
			return (
				block_type === ( blocksLevel ? 'core/button' : undefined ) &&
				section === 'color' &&
				field === 'text' &&
				element_type === undefined &&
				palette_slug === undefined &&
				typeof field_value === 'string' &&
				field_value[ 0 ] === '#'
			);
		} )
	);
	assert(
		updateEvents.some( ( event ) => {
			const { block_type, section, field, field_value, element_type, palette_slug } = event[ 1 ];
			return (
				block_type === ( blocksLevel ? 'core/button' : undefined ) &&
				section === 'typography' &&
				field === 'fontSize' &&
				element_type === undefined &&
				palette_slug === undefined &&
				field_value === '11px'
			);
		} )
	);
	assert(
		updateEvents.some( ( event ) => {
			const { block_type, section, field, field_value, element_type, palette_slug } = event[ 1 ];
			return (
				block_type === ( blocksLevel ? 'core/column' : undefined ) &&
				section === 'color' &&
				field === 'text' &&
				element_type === 'link' &&
				palette_slug === undefined &&
				typeof field_value === 'string' &&
				field_value[ 0 ] === '#'
			);
		} )
	);

	await clearEventsStack( driver );
	await clickGlobalStylesResetButton( driver );
	await driver.sleep( 500 );
	updateEvents = await getGlobalStylesUpdateEvents( driver );

	assert.strictEqual( updateEvents.length, 3 );
	assert(
		updateEvents.some( ( event ) => {
			const { block_type, section, field, field_value, element_type, palette_slug } = event[ 1 ];
			return (
				block_type === ( blocksLevel ? 'core/button' : undefined ) &&
				section === 'color' &&
				field === 'text' &&
				element_type === undefined &&
				palette_slug === undefined &&
				field_value === 'reset'
			);
		} )
	);
	assert(
		updateEvents.some( ( event ) => {
			const { block_type, section, field, field_value, element_type, palette_slug } = event[ 1 ];
			return (
				block_type === ( blocksLevel ? 'core/button' : undefined ) &&
				section === 'typography' &&
				field === 'fontSize' &&
				element_type === undefined &&
				palette_slug === undefined &&
				field_value === 'reset'
			);
		} )
	);
	assert(
		updateEvents.some( ( event ) => {
			const { block_type, section, field, field_value, element_type, palette_slug } = event[ 1 ];
			return (
				block_type === ( blocksLevel ? 'core/column' : undefined ) &&
				section === 'color' &&
				field === 'text' &&
				element_type === 'link' &&
				palette_slug === undefined &&
				field_value === 'reset'
			);
		} )
	);
};

const testGlobalStylesColorPalette = async ( driver, blockName = undefined ) => {
	await changeGlobalStylesFirstColorPaletteItem( driver, '#ff0ff0' );

	// A timeout is necessary both because the function is debounced and needs time to retrieve
	// entities to compare.
	await driver.sleep( 500 );

	let updateEvents = await getEventsStack( driver );

	// The first palette change will instantiate all palette settings onto the global styles object.
	// We expect to see one update per palette setting.
	assert( updateEvents.length > 0 );
	updateEvents.forEach( ( event ) => {
		const { block_type, section, field, field_value, element_type, palette_slug } = event[ 1 ];
		assert(
			block_type === blockName &&
				section === 'color' &&
				field === 'palette' &&
				element_type === undefined &&
				typeof palette_slug === 'string' &&
				typeof field_value === 'string' &&
				field_value[ 0 ] === '#'
		);
	} );
	// Verify one of them has the value we set.
	assert(
		updateEvents.some( ( event ) => {
			const { block_type, section, field, field_value, element_type, palette_slug } = event[ 1 ];
			return (
				block_type === blockName &&
				section === 'color' &&
				field === 'palette' &&
				element_type === undefined &&
				typeof palette_slug === 'string' &&
				field_value === '#ff0ff0'
			);
		} )
	);
	await clearEventsStack( driver );
	await changeGlobalStylesFirstColorPaletteItem( driver, '#a1a1a1', true );
	await driver.sleep( 500 );
	updateEvents = await getGlobalStylesUpdateEvents( driver );

	// Now that settings have been instantiated, only one event should fire.
	assert.strictEqual( updateEvents.length, 1 );

	assert(
		( function () {
			const {
				block_type,
				section,
				field,
				field_value,
				element_type,
				palette_slug,
			} = updateEvents[ 0 ][ 1 ];
			return (
				block_type === blockName &&
				section === 'color' &&
				field === 'palette' &&
				element_type === undefined &&
				typeof palette_slug === 'string' &&
				typeof field_value === 'string' &&
				field_value === '#a1a1a1'
			);
		} )()
	);

	// Toggle the menu to ensure the color picker closes.
	// Otherwise clicking 'reset' will close the color picker after the reset
	// takes place, causing an unwanted update to that value.
	await clickGlobalStylesButton( driver );
	await clickGlobalStylesButton( driver );

	await clearEventsStack( driver );

	await clickGlobalStylesResetButton( driver );
	await driver.sleep( 500 );

	updateEvents = await getGlobalStylesUpdateEvents( driver );

	updateEvents.forEach( ( event ) => {
		const { block_type, section, field, field_value, element_type, palette_slug } = event[ 1 ];
		assert(
			block_type === blockName &&
				section === 'color' &&
				field === 'palette' &&
				element_type === undefined &&
				typeof palette_slug === 'string' &&
				field_value === 'reset'
		);
	} );
};

const GLOBAL_STYLES_ROOT_TAB_NAME = 'root';
const GLOBAL_STYLES_BLOCK_TYPE_TAB_NAME = 'block-type';

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
			await deleteTemplatesAndTemplateParts( this.driver );
		} );

		it( 'should skip tracking "wpcom_block_editor_nav_sidebar_item_edit" when editor just loaded (no query params)', async function () {
			const eventsStack = await getEventsStack( this.driver );
			const isEditEventNotTriggered = ! eventsStack.find(
				( [ eventName ] ) => eventName === 'wpcom_block_editor_nav_sidebar_item_edit'
			);
			assert( isEditEventNotTriggered );
		} );

		createGeneralTests( { it, editorType: 'site', baseContext: 'template' } );

		describe( 'Tracks "wpcom_block_editor_global_styles_tab_selected', function () {
			it( 'when Global Styles sidebar is opened', async function () {
				const editor = await SiteEditorComponent.Expect( this.driver );

				await editor.toggleGlobalStyles();

				const eventsStack = await getEventsStack( this.driver );
				const tabSelectedEvents = eventsStack.filter(
					( [ eventName ] ) => eventName === 'wpcom_block_editor_global_styles_tab_selected'
				);
				assert.strictEqual( tabSelectedEvents.length, 1 );
				const [ , eventData ] = tabSelectedEvents[ 0 ];
				assert.strictEqual( eventData.tab, GLOBAL_STYLES_ROOT_TAB_NAME );
				assert.strictEqual( eventData.open, true );
			} );

			it( 'when Global Styles sidebar is closed', async function () {
				const editor = await SiteEditorComponent.Expect( this.driver );

				// Note the sidebar is already open here because of the previous test.
				await editor.toggleGlobalStyles();

				const tabSelectedEvents = await getGlobalStylesTabSelectedEvents( this.driver );
				assert.strictEqual( tabSelectedEvents.length, 1 );
				const [ , eventData ] = tabSelectedEvents[ 0 ];
				assert.strictEqual( eventData.tab, GLOBAL_STYLES_ROOT_TAB_NAME );
				assert.strictEqual( eventData.open, false );
			} );

			it( `when Global Styles sidebar is closed by opening another sidebar (tab = ${ GLOBAL_STYLES_ROOT_TAB_NAME })`, async function () {
				const editor = await SiteEditorComponent.Expect( this.driver );

				// It is not possible to open multiple sidebars on mobile.
				if ( editor.screenSize === 'mobile' ) {
					return this.skip();
				}

				await editor.toggleGlobalStyles();
				await clickBlockSettingsButton( this.driver );

				const tabSelectedEvents = await getGlobalStylesTabSelectedEvents( this.driver );
				assert.strictEqual( tabSelectedEvents.length, 2 );
				const [ , eventData ] = tabSelectedEvents[ 0 ];
				assert.strictEqual( eventData.tab, GLOBAL_STYLES_ROOT_TAB_NAME );
				assert.strictEqual( eventData.open, false );
			} );

			it( `when Global Styles sidebar is closed by opening another sidebar (tab = ${ GLOBAL_STYLES_BLOCK_TYPE_TAB_NAME })`, async function () {
				const editor = await SiteEditorComponent.Expect( this.driver );

				// It is not possible to open multiple sidebars on mobile.
				if ( editor.screenSize === 'mobile' ) {
					return this.skip();
				}

				await editor.toggleGlobalStyles();
				await clickGlobalStylesBlockTypeTab( this.driver );
				await clickBlockSettingsButton( this.driver );

				const tabSelectedEvents = await getGlobalStylesTabSelectedEvents( this.driver );
				assert.strictEqual( tabSelectedEvents.length, 3 );
				const [ , eventData ] = tabSelectedEvents[ 0 ];
				assert.strictEqual( eventData.tab, GLOBAL_STYLES_BLOCK_TYPE_TAB_NAME );
				assert.strictEqual( eventData.open, false );
			} );

			it( 'when tab is changed in Global Styles sidebar', async function () {
				const editor = await SiteEditorComponent.Expect( this.driver );

				await editor.toggleGlobalStyles();
				await clickGlobalStylesBlockTypeTab( this.driver );
				await clickGlobalStylesRootTab( this.driver );

				const tabSelectedEvents = await getGlobalStylesTabSelectedEvents( this.driver );
				assert.strictEqual( tabSelectedEvents.length, 3 );
				const [ , blockTypeSelectedEventData ] = tabSelectedEvents[ 1 ];
				assert.strictEqual( blockTypeSelectedEventData.tab, GLOBAL_STYLES_BLOCK_TYPE_TAB_NAME );
				assert.strictEqual( blockTypeSelectedEventData.open, true );
				const [ , rootSelectedEventData ] = tabSelectedEvents[ 2 ];
				assert.strictEqual( rootSelectedEventData.tab, GLOBAL_STYLES_ROOT_TAB_NAME );
				assert.strictEqual( rootSelectedEventData.open, true );
			} );

			it( 'should not trigger the event when clicking on the already active tab', async function () {
				await clickGlobalStylesRootTab( this.driver );
				await clickGlobalStylesRootTab( this.driver );
				await clickGlobalStylesRootTab( this.driver );

				const tabSelectedEvents = await getGlobalStylesTabSelectedEvents( this.driver );
				assert.strictEqual( tabSelectedEvents.length, 0 );
			} );

			after( async function () {
				const editor = await SiteEditorComponent.Expect( this.driver );
				await editor.closeGlobalStyles();
			} );
		} );

		describe( 'Tracks "wpcom_block_editor_global_styles_update"', function () {
			before( async function () {
				const editor = await SiteEditorComponent.Expect( this.driver );
				await editor.toggleGlobalStyles();
			} );

			// Since these events are tracked via redux actions in updateEntityRecord and
			// saveEditedEntityRecord, they are independent of UI.  If the desktop flow populates
			// these events properly, the mobile flow will as well.  There is no added benefit to
			// maintaining these interactions in e2e for both viewport sizes.
			it( 'global color and typography', async function () {
				const editor = await SiteEditorComponent.Expect( this.driver );
				if ( editor.screenSize === 'mobile' ) {
					return this.skip();
				}
				// Reset Global Styles before testing.
				await clickGlobalStylesResetButton( this.driver );
				await saveGlobalStyles( this.driver );
				await clearEventsStack( this.driver );

				await testGlobalStylesColorAndTypography( this.driver );
			} );

			it( 'global color palette settings', async function () {
				const editor = await SiteEditorComponent.Expect( this.driver );
				if ( editor.screenSize === 'mobile' ) {
					return this.skip();
				}
				await testGlobalStylesColorPalette( this.driver );
			} );

			it( 'block level typography and color', async function () {
				const editor = await SiteEditorComponent.Expect( this.driver );
				if ( editor.screenSize === 'mobile' ) {
					return this.skip();
				}
				await testGlobalStylesColorAndTypography( this.driver, true );
			} );

			it( 'block level color palette settings', async function () {
				const editor = await SiteEditorComponent.Expect( this.driver );
				if ( editor.screenSize === 'mobile' ) {
					return this.skip();
				}
				await testGlobalStylesColorPalette( this.driver, 'core/column' );
			} );

			after( async function () {
				const editor = await SiteEditorComponent.Expect( this.driver );
				await editor.closeGlobalStyles();
			} );
		} );

		describe( 'Tracks "wpcom_block_editor_global_styles_save"', function () {
			before( async function () {
				const editor = await SiteEditorComponent.Expect( this.driver );
				await editor.toggleGlobalStyles();
			} );

			// This test can be less intensive than our global styles update tests since they share
			// the same code to build event structure from global styles objects.  So we mainly need
			// to verify that the expected number of events are triggered.
			it( 'sends the expected amount of tracks events', async function () {
				const editor = await SiteEditorComponent.Expect( this.driver );
				if ( editor.screenSize === 'mobile' ) {
					return this.skip();
				}

				// Reset global styles before testing.
				await clickGlobalStylesResetButton( this.driver );
				await saveGlobalStyles( this.driver );
				await clearEventsStack( this.driver );

				await changeGlobalStylesFontSize( this.driver, '11' );
				await changeGlobalStylesColor( this.driver, 1, 1 );
				await changeGlobalStylesColor( this.driver, 3, 1 );
				await saveGlobalStyles( this.driver );
				const saveEvents = ( await getEventsStack( this.driver ) ).filter(
					( event ) => event[ 0 ] === 'wpcom_block_editor_global_styles_save'
				);
				assert.strictEqual( saveEvents.length, 3 );

				// Clean up by resetting to be safe.
				await clickGlobalStylesResetButton( this.driver );
				await saveGlobalStyles( this.driver );
			} );

			after( async function () {
				const editor = await SiteEditorComponent.Expect( this.driver );
				await editor.closeGlobalStyles();
			} );
		} );

		it( "Shouldn't track replaceInnerBlocks when template parts load", async function () {
			const editor = await SiteEditorComponent.Expect( this.driver );

			await editor.addBlock( 'Template Part' );
			await clearEventsStack( this.driver );

			await editor.runInCanvas( async () => {
				await driverHelper.clickWhenClickable(
					this.driver,
					By.css( '.wp-block-template-part.is-selected button.is-primary' )
				);
			} );
			await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.wp-block-template-part__selection-preview-item' )
			);
			await editor.waitForTemplatePartsToLoad();
			await editor.dismissNotices();

			const eventsStack = await getEventsStack( this.driver );
			const blockInsertedEventFired = eventsStack.some(
				( [ eventName ] ) => eventName === 'wpcom_block_inserted'
			);
			assert.strictEqual(
				blockInsertedEventFired,
				false,
				'"wpcom_block_inserted" editor tracking event fired when template parts load, this should not happen'
			);
		} );

		it( "Shouldn't track replaceInnerBlocks after undoing or redoing a template part edit", async function () {
			const editor = await SiteEditorComponent.Expect( this.driver );

			// This test relies on undo and redo which isn't available on mobile.
			if ( editor.screenSize === 'mobile' ) {
				return this.skip();
			}

			// Insert a template part block and clear the events stack
			// so the insert event won't intefere with our asserts.
			const blockId = await editor.addBlock( 'Template Part' );
			await clearEventsStack( this.driver );

			// Add a template part block and select an existing template part.
			// Make sure the template part is loaded before moving on.
			await editor.runInCanvas( async () => {
				await driverHelper.clickWhenClickable(
					this.driver,
					By.css( '.wp-block-template-part.is-selected button.is-primary' )
				);
			} );
			await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.wp-block-template-part__selection-preview-item' )
			);
			await editor.waitForTemplatePartsToLoad();
			await editor.dismissNotices();

			// Let's find out the ID of the first child block of the template part
			// and remove the block.
			let childBlockId;
			await editor.runInCanvas( async () => {
				const element = await this.driver.findElement( By.css( `#${ blockId } > .wp-block` ) );
				childBlockId = await element.getAttribute( 'id' );
			} );
			await editor.removeBlock( childBlockId );

			// Undo
			await clearEventsStack( this.driver );
			await driverHelper.clickWhenClickable( this.driver, By.css( 'button[aria-label="Undo"]' ) );
			let eventsStack = await getEventsStack( this.driver );
			let blockInsertedEventFired = eventsStack.some(
				( [ eventName ] ) => eventName === 'wpcom_block_inserted'
			);
			assert.strictEqual(
				blockInsertedEventFired,
				false,
				'"wpcom_block_inserted" editor tracking event fired when template part edits were undid , this should not happen'
			);

			// Redo
			await clearEventsStack( this.driver );
			await driverHelper.clickWhenClickable( this.driver, By.css( 'button[aria-label="Redo"]' ) );
			eventsStack = await getEventsStack( this.driver );
			blockInsertedEventFired = eventsStack.some(
				( [ eventName ] ) => eventName === 'wpcom_block_inserted'
			);
			assert.strictEqual(
				blockInsertedEventFired,
				false,
				'"wpcom_block_inserted" editor tracking event fired when template part edits were redid , this should not happen'
			);
		} );

		describe( 'tracks template part creation and replacement', function () {
			it( 'Tracks "wpcom_block_editor_create_template_part', async function () {
				// Reload editor to start from consistent clean slate for tests. At this point
				// avoiding to do so causes the bug report button to intercept clicks for
				// `editor.runInCanvas`, causing the suite to fail.
				await this.driver.navigate().refresh();
				await driverHelper.acceptAlertIfPresent( this.driver );

				const editor = await SiteEditorComponent.Expect( this.driver );
				// Clear block selection to ensure this starts at top level.
				await this.driver.executeScript(
					`return window.wp.data.dispatch( 'core/block-editor' ).selectBlock()`
				);

				const blockId = await editor.addBlock(
					'Header',
					'template-part\\/header',
					'Block: Template Part'
				);

				await editor.runInCanvas( async () => {
					const createNewHeaderLocator = driverHelper.createTextLocator(
						By.css( '.wp-block-template-part.is-selected .components-placeholder button' ),
						'New header'
					);
					await driverHelper.clickWhenClickable( this.driver, createNewHeaderLocator );

					const choosePatternLocator = driverHelper.createTextLocator(
						By.css( '.wp-block-template-part .block-editor-block-pattern-setup button' ),
						'Choose'
					);
					await driverHelper.clickWhenClickable( this.driver, choosePatternLocator );

					// Wait for this template part to load its new content.
					await driverHelper.waitUntilElementLocated(
						this.driver,
						By.css( `#${ blockId }.block-editor-block-list__layout` )
					);
				} );

				const eventsStack = await getEventsStack( this.driver );
				const createdEvents = eventsStack.filter(
					( event ) => event[ 0 ] === 'wpcom_block_editor_create_template_part'
				);

				assert.strictEqual( createdEvents.length, 1 );

				// Verify this doesn't trigger a convert_to event, as they track the same redux action.
				const convertedEvents = eventsStack.filter(
					( event ) => event[ 0 ] === 'wpcom_block_editor_convert_to_template_part'
				);
				assert.strictEqual( convertedEvents.length, 0 );

				const { variation_slug, content } = createdEvents[ 0 ][ 1 ];
				assert( variation_slug === 'header' && typeof content === 'string' && content.length > 0 );
			} );

			it( 'Tracks "wpcom_block_editor_template_part_choose_existing"', async function () {
				const editor = await SiteEditorComponent.Expect( this.driver );
				// Undo the template part creation to go back to the placeholder.  Use store api to
				// trigger undo since the UI is not present in mobile viewport.
				await this.driver.executeScript( `return window.wp.data.dispatch( 'core' ).undo()` );

				await editor.runInCanvas( async () => {
					const chooseExistingHeaderLocator = driverHelper.createTextLocator(
						By.css( '.wp-block-template-part.is-selected .components-placeholder button' ),
						'Choose existing'
					);
					await driverHelper.clickWhenClickable( this.driver, chooseExistingHeaderLocator );
				} );

				await driverHelper.clickWhenClickable(
					this.driver,
					By.css( '.wp-block-template-part__selection-preview-item' )
				);

				const eventsStack = await getEventsStack( this.driver );
				const chooseEvents = eventsStack.filter(
					( event ) => event[ 0 ] === 'wpcom_block_editor_template_part_choose_existing'
				);

				assert.strictEqual( chooseEvents.length, 1 );

				// Verify there are no replace events since these share the same selection component.
				const replaceEvents = eventsStack.filter(
					( event ) => event[ 0 ] === 'wpcom_block_editor_template_part_replace'
				);
				assert.strictEqual( replaceEvents.length, 0 );

				const { variation_slug, template_part_id } = chooseEvents[ 0 ][ 1 ];
				// Check the event props, assert id.length > 2 since the format is `{theme}//{slug}`.
				assert( variation_slug === 'header' );
				assert( typeof template_part_id === 'string' );
				assert( template_part_id.length > 2 );
			} );

			it( 'Tracks "wpcom_block_editor_template_part_replace"', async function () {
				const replaceButtonLocator = driverHelper.createTextLocator(
					By.css( '.components-toolbar-button' ),
					'Replace'
				);
				await driverHelper.clickWhenClickable( this.driver, replaceButtonLocator );
				await driverHelper.clickWhenClickable(
					this.driver,
					By.css( '.wp-block-template-part__selection-preview-item' )
				);

				const eventsStack = await getEventsStack( this.driver );
				const replaceEvents = eventsStack.filter(
					( event ) => event[ 0 ] === 'wpcom_block_editor_template_part_replace'
				);
				assert.strictEqual( replaceEvents.length, 1 );

				// Verify there are no choose_existing events since these share the same selection component.
				const chooseExistingEvents = eventsStack.filter(
					( event ) => event[ 0 ] === 'wpcom_block_editor_template_part_choose_existing'
				);
				assert.strictEqual( chooseExistingEvents.length, 0 );

				const {
					template_part_id,
					replaced_template_part_id,
					variation_slug,
					replaced_variation_slug,
				} = replaceEvents[ 0 ][ 1 ];
				assert(
					typeof template_part_id === 'string' &&
						template_part_id.length > 2 &&
						typeof replaced_template_part_id === 'string' &&
						replaced_template_part_id.length > 2 &&
						variation_slug === 'header' &&
						replaced_variation_slug === 'header'
				);
			} );
		} );

		describe( 'Navigation sidebar', function () {
			it( 'should track "wpcom_block_editor_nav_sidebar_open" when sidebar is opened', async function () {
				const editor = await SiteEditorComponent.Expect( this.driver );

				// We open and close the navigation sidebar to make sure the
				// event is only triggered on open. We use a separate events
				// stack to ensure it's triggered afte open but not close.
				await editor.toggleNavigationSidebar();
				const eventsStackAfterOpen = await getEventsStack( this.driver );
				await clearEventsStack( this.driver );
				await editor.toggleNavigationSidebar();
				const eventsStackAfterClose = await getEventsStack( this.driver );

				const openEventFiredOnceAfterOpen =
					eventsStackAfterOpen.filter(
						( [ eventName ] ) => eventName === 'wpcom_block_editor_nav_sidebar_open'
					).length === 1;
				const noOpenEventFiredOnceAfterClose = ! eventsStackAfterClose.some(
					( [ eventName ] ) => eventName === 'wpcom_block_editor_nav_sidebar_open'
				);
				assert(
					openEventFiredOnceAfterOpen,
					'"wpcom_block_editor_nav_sidebar_open" editor tracking event failed to fire only once'
				);
				assert(
					noOpenEventFiredOnceAfterClose,
					'"wpcom_block_editor_nav_sidebar_open" editor tracking event fired after close'
				);
			} );

			it( 'should track "wpcom_block_editor_nav_sidebar_item_edit" when switching to a template', async function () {
				const editor = await SiteEditorComponent.Expect( this.driver );

				await editor.toggleNavigationSidebar();
				const backButtonToTemplatesLocator = driverHelper.createTextLocator(
					By.css( '.components-navigation__back-button' ),
					'Templates'
				);
				await driverHelper.clickWhenClickable( this.driver, backButtonToTemplatesLocator );

				const templateMenuItemLocator = driverHelper.createTextLocator(
					By.css( '.edit-site-navigation-panel__template-item-title' ),
					'404'
				);
				await driverHelper.clickWhenClickable( this.driver, templateMenuItemLocator );

				const eventsStack = await getEventsStack( this.driver );
				const editEvents = eventsStack.filter(
					( [ eventName ] ) => eventName === 'wpcom_block_editor_nav_sidebar_item_edit'
				);
				assert.strictEqual( editEvents.length, 1 );
				const [ , editEventData ] = editEvents[ 0 ];
				assert.strictEqual( editEventData.item_type, 'template' );
				assert.strictEqual( editEventData.item_id, 'pub/tt1-blocks//404' );
				assert.strictEqual( editEventData.item_slug, '404' );
			} );

			it( 'should track "wpcom_block_editor_nav_sidebar_item_add" when creating a new template', async function () {
				const editor = await SiteEditorComponent.Expect( this.driver );

				await editor.toggleNavigationSidebar();

				await driverHelper.clickWhenClickable(
					this.driver,
					By.css(
						'[role="region"][aria-label="Navigation Sidebar"] button[aria-label="Add Template"]'
					)
				);
				await driverHelper.clickWhenClickable(
					this.driver,
					driverHelper.createTextLocator(
						By.css( '[role="menu"][aria-label="Add Template"] .components-menu-item__item' ),
						'Archive'
					)
				);

				const eventsStack = await getEventsStack( this.driver );
				const editEvents = eventsStack.filter(
					( [ eventName ] ) => eventName === 'wpcom_block_editor_nav_sidebar_item_add'
				);
				assert.strictEqual( editEvents.length, 1 );
				const [ , editEventData ] = editEvents[ 0 ];
				assert.strictEqual( editEventData.item_type, 'template' );
				assert.strictEqual( editEventData.item_slug, 'archive' );

				// Go back to index template and cleanup the new template early to avoid parallel
				// test conflicts as much as possible.
				const templateMenuItemLocator = driverHelper.createTextLocator(
					By.css( '.edit-site-navigation-panel__template-item-title' ),
					'Index'
				);
				await driverHelper.clickWhenClickable( this.driver, templateMenuItemLocator );
				await deleteCustomEntities( this.driver, 'wp_template' );
			} );

			it( 'should track "wpcom_block_editor_nav_sidebar_item_edit" when switching to a template part', async function () {
				const editor = await SiteEditorComponent.Expect( this.driver );

				await editor.toggleNavigationSidebar();
				await navigationSidebarBackToRoot( this.driver );

				await driverHelper.clickWhenClickable(
					this.driver,
					By.css(
						'[role="region"][aria-label="Navigation Sidebar"] [role="menu"] [title="Template Parts"] button'
					)
				);
				await driverHelper.clickWhenClickable(
					this.driver,
					By.css(
						'[role="region"][aria-label="Navigation Sidebar"] [role="menu"] [title="Headers"] button'
					)
				);

				const templateMenuItemLocator3 = driverHelper.createTextLocator(
					By.css( '.edit-site-navigation-panel__template-item-title' ),
					'header'
				);
				await driverHelper.clickWhenClickable( this.driver, templateMenuItemLocator3 );

				const eventsStack = await getEventsStack( this.driver );
				const editEvents = eventsStack.filter(
					( [ eventName ] ) => eventName === 'wpcom_block_editor_nav_sidebar_item_edit'
				);
				assert.strictEqual( editEvents.length, 1 );
				const [ , editEventData ] = editEvents[ 0 ];
				assert.strictEqual( editEventData.item_type, 'template_part' );
				assert.strictEqual( editEventData.item_id, 'pub/tt1-blocks//header' );
			} );

			it( 'make sure back to dashboard button exists', async function () {
				const editor = await SiteEditorComponent.Expect( this.driver );

				await editor.toggleNavigationSidebar();
				await navigationSidebarBackToRoot( this.driver );

				const isBackToDashboardLocated = await driverHelper.isElementEventuallyLocatedAndVisible(
					this.driver,
					By.css( '.edit-site-navigation-panel__back-to-dashboard' )
				);

				assert( isBackToDashboardLocated );
			} );

			it( 'should track "wpcom_block_editor_nav_sidebar_item_edit" when switching to a content item (type = page)', async function () {
				const pagesMenuItemLocator = By.css(
					'[role="region"][aria-label="Navigation Sidebar"] [role="menu"] [title="Pages"] button'
				);
				const contentMenuItemLocator = By.css(
					'[role="region"][aria-label="Navigation Sidebar"] [role="menu"] [title="Home"] button'
				);

				// We don't need to open the navigation sidebar. It's still open from the previous test.
				await driverHelper.clickWhenClickable( this.driver, pagesMenuItemLocator );
				await driverHelper.clickWhenClickable( this.driver, contentMenuItemLocator );

				const eventsStack = await getEventsStack( this.driver );
				const editEvents = eventsStack.filter(
					( [ eventName ] ) => eventName === 'wpcom_block_editor_nav_sidebar_item_edit'
				);
				assert.strictEqual( editEvents.length, 1 );
				const [ , editEventData ] = editEvents[ 0 ];
				assert.strictEqual( editEventData.item_type, 'page' );
				assert.strictEqual( editEventData.item_slug, 'home' );
			} );

			it( 'should track "wpcom_block_editor_nav_sidebar_item_edit" when switching to a category item (type = taxonomy_category)', async function () {
				const editor = await SiteEditorComponent.Expect( this.driver );
				const categoriesMenuItemLocator = By.css(
					'[role="region"][aria-label="Navigation Sidebar"] [role="menu"] [title="Categories"] button'
				);
				const contentMenuItemLocator = By.css(
					'[role="region"][aria-label="Navigation Sidebar"] [role="menu"] [title="Uncategorized"] button'
				);

				await editor.toggleNavigationSidebar();
				await navigationSidebarBackToRoot( this.driver );
				await driverHelper.clickWhenClickable( this.driver, categoriesMenuItemLocator );
				await driverHelper.clickWhenClickable( this.driver, contentMenuItemLocator );

				const eventsStack = await getEventsStack( this.driver );
				const editEvents = eventsStack.filter(
					( [ eventName ] ) => eventName === 'wpcom_block_editor_nav_sidebar_item_edit'
				);
				assert.strictEqual( editEvents.length, 1 );
				const [ , editEventData ] = editEvents[ 0 ];
				assert.strictEqual( editEventData.item_type, 'taxonomy_category' );
				assert.strictEqual( editEventData.item_slug, 'uncategorized' );
			} );

			it( 'should skip tracking "wpcom_block_editor_nav_sidebar_item_edit" when editor just loaded (with query params)', async function () {
				await this.driver.navigate().refresh();
				await driverHelper.acceptAlertIfPresent( this.driver );

				const editor = await SiteEditorComponent.Expect( this.driver );
				await editor.waitForTemplateToLoad();
				await editor.waitForTemplatePartsToLoad();

				const eventsStack = await getEventsStack( this.driver );
				const isEditEventNotTriggered = ! eventsStack.find(
					( [ eventName ] ) => eventName === 'wpcom_block_editor_nav_sidebar_item_edit'
				);
				assert( isEditEventNotTriggered );
			} );
		} );

		it( 'Tracks "wpcom_block_editor_convert_to_template_part"', async function () {
			const editor = await SiteEditorComponent.Expect( this.driver );

			const threeColumnsEqualSplitVariationLocator = By.css(
				'[aria-label="Three columns; equal split"]'
			);
			const selectParentColumnsBlockLocator = By.css( '[aria-label="Select Columns"]' );
			const blockToolbarOptionsLocator = By.css(
				'[aria-label="Block tools"] [aria-label="Options"]'
			);
			const makeTemplatePartOptionsItemLocator = driverHelper.createTextLocator(
				By.css( '[aria-label="Options"] button' ),
				'Make template part'
			);
			const makeTemplatePartDialogNameInputLocator = By.css( '[role="dialog"] input[type="text"]' );
			const makeTemplatePartDialogSubmitButtonLocator = By.css(
				'[role="dialog"] button[type="submit"]'
			);
			const snackbarNoticeLocator = By.css(
				'.components-snackbar[aria-label="Dismiss this notice"]'
			);
			await editor.addBlock( 'Columns' );
			await editor.runInCanvas( async () => {
				await driverHelper.clickWhenClickable(
					this.driver,
					threeColumnsEqualSplitVariationLocator
				);
			} );
			// There is no way to select the parent block on mobile. We simulate
			// an arrow up key press which navigates to the parent Columns block
			// in this case.
			if ( editor.screenSize === 'mobile' ) {
				await this.driver.actions().sendKeys( Key.ARROW_UP ).perform();
			} else {
				await driverHelper.clickWhenClickable( this.driver, selectParentColumnsBlockLocator );
			}
			await driverHelper.clickWhenClickable( this.driver, blockToolbarOptionsLocator );
			await driverHelper.clickWhenClickable( this.driver, makeTemplatePartOptionsItemLocator );
			await driverHelper.setWhenSettable(
				this.driver,
				makeTemplatePartDialogNameInputLocator,
				'test_make_template_part'
			);
			await driverHelper.clickWhenClickable(
				this.driver,
				makeTemplatePartDialogSubmitButtonLocator
			);
			await driverHelper.clickWhenClickable( this.driver, snackbarNoticeLocator );

			const events = await getEventsStack( this.driver );
			const convertEvents = events.filter(
				( [ eventName ] ) => eventName === 'wpcom_block_editor_convert_to_template_part'
			);
			assert( convertEvents.length === 2 );
			assert(
				convertEvents[ 0 ][ 1 ].block_names === 'core/columns,core/column,core/column,core/column'
			);
			assert( typeof convertEvents[ 1 ][ 1 ].block_names );
		} );

		it( 'Tracks "wpcom_block_editor_template_part_detach_blocks"', async function () {
			const blockToolbarOptionsLocator = By.css(
				'[aria-label="Block tools"] [aria-label="Options"]'
			);
			const detachBlocksOptionsItemLocator = driverHelper.createTextLocator(
				By.css( '[aria-label="Options"] button' ),
				'Detach blocks from template part'
			);
			await driverHelper.clickWhenClickable( this.driver, blockToolbarOptionsLocator );
			await driverHelper.clickWhenClickable( this.driver, detachBlocksOptionsItemLocator );

			const events = await getEventsStack( this.driver );
			const detachEvents = events.filter(
				( [ eventName ] ) => eventName === 'wpcom_block_editor_template_part_detach_blocks'
			);
			assert.strictEqual( detachEvents.length, 2 );
			assert( detachEvents[ 0 ][ 1 ].template_part_id );
			assert( detachEvents[ 0 ][ 1 ].variation_slug );
			assert.strictEqual(
				detachEvents[ 0 ][ 1 ].block_names,
				'core/columns,core/column,core/column,core/column'
			);
			assert( detachEvents[ 1 ][ 1 ].template_part_id );
			assert( detachEvents[ 1 ][ 1 ].variation_slug );
			assert.strictEqual( typeof detachEvents[ 1 ][ 1 ].block_names, 'undefined' );
			const replaceBlockEvents = events.filter(
				( [ eventName ] ) => eventName === 'wpcom_block_picker_block_inserted'
			);
			assert.strictEqual(
				replaceBlockEvents.length,
				0,
				"detaching blocks from template part shouldn't trigger replace blocks event"
			);
		} );

		describe( 'tracks "entity_context" property for block events in a template part', function () {
			it( 'For "wpcom_block_inserted" event', async function () {
				// Reload editor to start from consistent clean slate for tests.
				await this.driver.navigate().refresh();
				await driverHelper.acceptAlertIfPresent( this.driver );

				const editor = await SiteEditorComponent.Expect( this.driver );
				await editor.waitForTemplateToLoad();
				await editor.waitForTemplatePartsToLoad();
				await clearEventsStack( this.driver );

				// Insert a block at the end of the template part.
				await editor.runInCanvas( async () => {
					await driverHelper.clickWhenClickable( this.driver, By.css( '.wp-block-template-part' ) );
					await driverHelper.clickWhenClickable(
						this.driver,
						By.css( '.block-editor-inserter__toggle' )
					);
				} );
				const quickInserterSearchInputLocator = By.css(
					'.block-editor-inserter__quick-inserter .block-editor-inserter__search-input'
				);
				const blockItemLocator = By.css(
					'.block-editor-inserter__quick-inserter .block-editor-block-types-list__item'
				);
				await driverHelper.setWhenSettable(
					this.driver,
					quickInserterSearchInputLocator,
					'Heading'
				);
				await driverHelper.clickWhenClickable( this.driver, blockItemLocator );

				const insertedEvents = ( await getEventsStack( this.driver ) ).filter(
					( event ) => event[ 0 ] === 'wpcom_block_inserted'
				);

				assert.strictEqual( insertedEvents.length, 1 );
				assert.strictEqual( insertedEvents[ 0 ][ 1 ].entity_context, 'core/template-part/header' );
				assert.strictEqual( insertedEvents[ 0 ][ 1 ].template_part_id, 'pub/tt1-blocks//header' );
			} );

			it( 'For "wpcom_block_moved_*" events', async function () {
				await SiteEditorComponent.Expect( this.driver );

				await driverHelper.clickWhenClickable(
					this.driver,
					By.css( '.block-editor-block-mover-button.is-up-button' )
				);
				await driverHelper.clickWhenClickable(
					this.driver,
					By.css( '.block-editor-block-mover-button.is-down-button' )
				);

				const events = await getEventsStack( this.driver );
				assert.strictEqual( events.length, 2 );

				const matchesContext = events.filter(
					( event ) =>
						event[ 1 ].entity_context === 'core/template-part/header' &&
						event[ 1 ].template_part_id === 'pub/tt1-blocks//header'
				);
				assert.strictEqual( matchesContext.length, 2 );
			} );

			it( 'For "wpcom_block_deleted" events', async function () {
				await SiteEditorComponent.Expect( this.driver );

				const blockToolbarOptionsLocator = By.css(
					'[aria-label="Block tools"] [aria-label="Options"]'
				);
				const removeBlockOptionsItemLocator = driverHelper.createTextLocator(
					By.css( '[aria-label="Options"] button' ),
					'Remove block'
				);
				await driverHelper.clickWhenClickable( this.driver, blockToolbarOptionsLocator );
				await driverHelper.clickWhenClickable( this.driver, removeBlockOptionsItemLocator );

				const events = await getEventsStack( this.driver );

				assert.strictEqual( events.length, 1 );
				assert.strictEqual( events[ 0 ][ 1 ].entity_context, 'core/template-part/header' );
				assert.strictEqual( events[ 0 ][ 1 ].template_part_id, 'pub/tt1-blocks//header' );
			} );
		} );

		afterEach( async function () {
			await clearEventsStack( this.driver );
		} );

		after( async function () {
			await deleteTemplatesAndTemplateParts( this.driver );
		} );
	} );
} );
