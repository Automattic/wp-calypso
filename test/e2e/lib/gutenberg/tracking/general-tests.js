import assert from 'assert';
import { By } from 'selenium-webdriver';
import SiteEditorComponent from '../../components/site-editor-component';
import * as driverHelper from '../../driver-helper';
import GutenbergEditorComponent from '../gutenberg-editor-component';
import { clearEventsStack, getEventsStack, getTotalEventsFiredForBlock } from './utils';

// eslint-disable-next-line jest/no-export
export function createGeneralTests( { it, editorType, postType, baseContext = undefined } ) {
	const isSiteEditor = editorType === 'site';
	const gutenbergEditorType = isSiteEditor ? 'iframe' : 'wp-admin';
	const EditorComponent = isSiteEditor ? SiteEditorComponent : GutenbergEditorComponent;

	it( 'Check for presence of e2e specific tracking events stack on global', async function () {
		await EditorComponent.Expect( this.driver, gutenbergEditorType );
		const eventsStack = await getEventsStack( this.driver );
		assert.strictEqual(
			Array.isArray( eventsStack ),
			true,
			'Tracking events stack missing from window._e2eEventsStack'
		);
	} );

	it( 'Make sure required and custom properties are added to the events', async function () {
		const editor = await EditorComponent.Expect( this.driver, gutenbergEditorType );

		// Populate the event stack by inserting a few blocks
		await editor.addBlock( 'Heading' );
		await editor.addBlock( 'Columns' );
		await editor.addBlock( 'Columns' );

		const eventsStack = await getEventsStack( this.driver );

		const requiredProperties = [ 'blog_id', 'site_type', 'user_locale' ];
		const customProperties = [ 'editor_type', 'post_type' ];
		const allProperties = [ ...requiredProperties, ...customProperties ];
		allProperties.forEach( ( property ) => {
			eventsStack.forEach( ( [ eventName, eventData ] ) => {
				// `post_type` is only set when `editor_type` is set to `post`.
				// We skip the assert in other cases.
				if ( eventData.editor_type !== 'post' && property === 'post_type' ) {
					return;
				}

				assert.notStrictEqual(
					typeof eventData[ property ],
					'undefined',
					`'${ property }' is missing from an event: '${ eventName }'`
				);
			} );
		} );
	} );

	it( `'editor_type' property should be '${ editorType }','post_type' property should be '${ postType }', and 'entity_context' should be '${ baseContext }' when editing a post`, async function () {
		const editor = await EditorComponent.Expect( this.driver, gutenbergEditorType );

		await editor.addBlock( 'Heading' );

		const eventsStack = await getEventsStack( this.driver );
		const lastEventData = eventsStack[ 0 ][ 1 ];
		assert.strictEqual(
			lastEventData.editor_type,
			editorType,
			`'editor_type' property does not match '${ editorType }', actual '${ lastEventData.editor_type }'`
		);
		assert.strictEqual(
			lastEventData.post_type,
			postType,
			`'post_type' property does not match '${ postType }', actual '${ lastEventData.post_type }'`
		);
		assert.strictEqual(
			lastEventData.entity_context,
			baseContext,
			`'post_type' property does not match '${ postType }', actual '${ lastEventData.post_type }'`
		);
	} );

	it( 'Tracks "wpcom_block_inserted" event', async function () {
		const editor = await EditorComponent.Expect( this.driver, gutenbergEditorType );

		// Insert some Blocks
		await editor.addBlock( 'Heading' );
		await editor.addBlock( 'Columns' );
		await editor.addBlock( 'Columns' );

		// Grab the events stack (only present on e2e test envs).
		// see: https://github.com/Automattic/wp-calypso/pull/41329
		const eventsStack = await getEventsStack( this.driver );

		// Assert that all block insertion events were tracked correctly
		assert.strictEqual(
			getTotalEventsFiredForBlock( eventsStack, 'wpcom_block_inserted', 'core/heading' ),
			1,
			`"wpcom_block_inserted" editor tracking event failed to fire for core/heading`
		);

		assert.strictEqual(
			getTotalEventsFiredForBlock( eventsStack, 'wpcom_block_inserted', 'core/columns' ),
			2,
			`"wpcom_block_inserted" editor tracking event failed to fire twice for core/columns`
		);

		const matchesExpectedContext = eventsStack.filter(
			( event ) =>
				event[ 0 ] === 'wpcom_block_inserted' && event[ 1 ].entity_context === baseContext
		);

		assert.strictEqual(
			matchesExpectedContext.length,
			3,
			'"wpcom_block_inserted" does not have expected entity context at top level'
		);
	} );

	it( 'Tracks "wpcom_block_editor_list_view_toggle" event', async function () {
		const editor = await EditorComponent.Expect( this.driver, gutenbergEditorType );

		// The list view toggle button is not available on mobile
		if ( editor.screenSize === 'mobile' ) {
			return this.skip();
		}

		await editor.toggleListView(); // Open list view
		await editor.toggleListView(); // Close list view

		const eventsStack = await getEventsStack( this.driver );
		const toggleEvents = eventsStack.filter(
			( [ eventName ] ) => eventName === 'wpcom_block_editor_list_view_toggle'
		);
		assert.strictEqual( toggleEvents.length, 2 );
		assert.strictEqual( toggleEvents[ 0 ][ 1 ].is_open, false );
		assert.strictEqual( toggleEvents[ 1 ][ 1 ].is_open, true );
	} );

	it( 'Tracks "wpcom_block_editor_list_view_select" event', async function () {
		const editor = await EditorComponent.Expect( this.driver, gutenbergEditorType );

		// The list view toggle button is not available on mobile
		if ( editor.screenSize === 'mobile' ) {
			return this.skip();
		}

		await editor.addBlock( 'Heading' );
		await editor.addBlock( 'Image' );

		await editor.toggleListView();

		const secondLastItemLocator = By.css(
			'[aria-label="Block navigation structure"] [role="row"]:nth-last-child(2) button'
		);
		const lastItemLocator = By.css(
			'[aria-label="Block navigation structure"] [role="row"]:nth-last-child(1) button'
		);
		await driverHelper.clickWhenClickable( this.driver, secondLastItemLocator );
		await driverHelper.clickWhenClickable( this.driver, lastItemLocator );

		// Close list view so we don't leave it open for the other tests.
		await editor.toggleListView();

		const eventsStack = await getEventsStack( this.driver );
		const selectEvents = eventsStack.filter(
			( [ eventName ] ) => eventName === 'wpcom_block_editor_list_view_select'
		);
		assert.strictEqual( selectEvents.length, 2 );
		assert.strictEqual( selectEvents[ 0 ][ 1 ].block_name, 'core/image' );
		assert.strictEqual( selectEvents[ 1 ][ 1 ].block_name, 'core/heading' );
	} );

	it( 'Tracks "wpcom_block_editor_undo_performed" event', async function () {
		const editor = await EditorComponent.Expect( this.driver, gutenbergEditorType );

		// The undo button is not available on mobile
		if ( editor.screenSize === 'mobile' ) {
			return this.skip();
		}

		await editor.addBlock( 'Heading' );
		await editor.addBlock( 'Columns' );
		await editor.addBlock( 'Columns' );

		await driverHelper.clickWhenClickable( this.driver, By.css( 'button[aria-label="Undo"]' ) );

		const eventsStack = await getEventsStack( this.driver );
		const undoFiredOnce =
			eventsStack.filter( ( [ eventName ] ) => eventName === 'wpcom_block_editor_undo_performed' )
				.length === 1;
		assert.strictEqual(
			undoFiredOnce,
			true,
			'"wpcom_block_editor_undo_performed" editor tracking event failed to fire only once'
		);
	} );

	it( 'Tracks "wpcom_block_editor_redo_performed" event', async function () {
		const editor = await EditorComponent.Expect( this.driver, gutenbergEditorType );

		// The redo button is not available on mobile
		if ( editor.screenSize === 'mobile' ) {
			return this.skip();
		}

		await editor.addBlock( 'Heading' );
		await editor.addBlock( 'Columns' );
		await editor.addBlock( 'Columns' );

		await driverHelper.clickWhenClickable( this.driver, By.css( 'button[aria-label="Undo"]' ) );
		await driverHelper.clickWhenClickable( this.driver, By.css( 'button[aria-label="Redo"]' ) );

		const eventsStack = await getEventsStack( this.driver );
		const redoFiredOnce =
			eventsStack.filter( ( [ eventName ] ) => eventName === 'wpcom_block_editor_redo_performed' )
				.length === 1;
		assert.strictEqual(
			redoFiredOnce,
			true,
			'"wpcom_block_editor_redo_performed" editor tracking event failed to fire only once'
		);
	} );

	it( `Block editor sidebar toggle should not trigger the "wpcom_block_editor_close_click" event`, async function () {
		const editor = await EditorComponent.Expect( this.driver, gutenbergEditorType );

		// The button that triggers the block editor sidebar is not available on mobile
		if ( editor.screenSize === 'mobile' && editorType === 'post' ) {
			return this.skip();
		}

		// We open and close the sidebar to make sure we don't leave the sidebar
		// open for the upcoming tests. We also make sure we don't trigger the
		// on open and close actions.
		await editor.toggleBlockEditorSidebar();
		await editor.toggleBlockEditorSidebar();

		const eventsStack = await getEventsStack( this.driver );
		const editorCloseClickNotFired = ! eventsStack.some(
			( [ eventName ] ) => eventName === 'wpcom_block_editor_close_click'
		);
		assert(
			editorCloseClickNotFired,
			'"wpcom_block_editor_close_click" editor tracking event fired'
		);
	} );

	it( 'Tracks "wpcom_pattern_inserted" through sidebar', async function () {
		const editor = await EditorComponent.Expect( this.driver, gutenbergEditorType );

		await editor.insertPattern( 'list', 'List with Image' );
		const eventsStackList = await getEventsStack( this.driver );
		await clearEventsStack( this.driver );
		await editor.dismissNotices();

		await editor.insertPattern( 'gallery', 'Heading and Three Images' );
		await editor.dismissNotices();

		// We need to save the eventsStack after each insertion to make sure we
		// aren't running out of the E2E queue size.
		const eventsStackGallery = await getEventsStack( this.driver );
		if ( await editor.isBlockInserterOpen() ) {
			await editor.closeBlockInserter();
		}

		const patternInsertedEvents = [ ...eventsStackGallery, ...eventsStackList ].filter(
			( [ eventName ] ) => eventName === 'wpcom_pattern_inserted'
		);
		assert.strictEqual(
			patternInsertedEvents.length,
			2,
			'"wpcom_pattern_inserted" editor tracking event failed to fire for both patterns'
		);
		const [ , eventDataGallery ] = patternInsertedEvents[ 0 ];
		const [ , eventDataList ] = patternInsertedEvents[ 1 ];
		assert.strictEqual(
			eventDataGallery.pattern_name,
			'a8c/heading-and-three-images',
			'"wpcom_pattern_inserted" editor tracking event pattern name property is incorrect'
		);
		assert.strictEqual(
			eventDataGallery.pattern_category,
			'gallery',
			'"wpcom_pattern_inserted" editor tracking event pattern category property is incorrect'
		);
		assert.strictEqual(
			eventDataList.pattern_name,
			'a8c/list-with-image',
			'"wpcom_pattern_inserted" editor tracking event pattern name property is incorrect'
		);
		assert.strictEqual(
			eventDataList.pattern_category,
			'list',
			'"wpcom_pattern_inserted" editor tracking event pattern category property is incorrect'
		);
		assert.strictEqual(
			eventDataList.entity_context,
			baseContext,
			`"wpcom_pattern_inserted" editor tracking event entity context is incorrect`
		);
	} );

	it( 'Tracks "wpcom_pattern_inserted" through quick inserter', async function () {
		const editor = await EditorComponent.Expect( this.driver, gutenbergEditorType );

		await editor.insertBlockOrPatternViaBlockAppender( 'List with Image' );
		const eventsStackList = await getEventsStack( this.driver );
		await clearEventsStack( this.driver );

		await editor.insertBlockOrPatternViaBlockAppender( 'Heading and Three Images' );
		// We need to save the eventsStack after each insertion to make sure we
		// aren't running out of the E2E queue size.
		const eventsStackGallery = await getEventsStack( this.driver );
		await editor.dismissNotices();

		const patternInsertedEvents = [ ...eventsStackGallery, ...eventsStackList ].filter(
			( [ eventName ] ) => eventName === 'wpcom_pattern_inserted'
		);
		assert.strictEqual(
			patternInsertedEvents.length,
			2,
			'"wpcom_pattern_inserted" editor tracking event failed to fire for both patterns'
		);
		const [ , eventDataGallery ] = patternInsertedEvents[ 0 ];
		const [ , eventDataList ] = patternInsertedEvents[ 1 ];
		assert.strictEqual(
			eventDataGallery.pattern_name,
			'a8c/heading-and-three-images',
			'"wpcom_pattern_inserted" editor tracking event pattern name property is incorrect'
		);
		assert.strictEqual(
			typeof eventDataGallery.pattern_category,
			'undefined',
			'"wpcom_pattern_inserted" editor tracking event pattern category property should not be present'
		);
		assert.strictEqual(
			eventDataList.pattern_name,
			'a8c/list-with-image',
			'"wpcom_pattern_inserted" editor tracking event pattern name property is incorrect'
		);
		assert.strictEqual(
			typeof eventDataGallery.pattern_category,
			'undefined',
			'"wpcom_pattern_inserted" editor tracking event pattern category property should not be present'
		);
		assert.strictEqual(
			eventDataList.entity_context,
			baseContext,
			`"wpcom_pattern_inserted" editor tracking event entity context is incorrect`
		);
	} );

	if ( editorType === 'post' ) {
		it( 'Tracks "wpcom_block_editor_details_open" event', async function () {
			const editor = await EditorComponent.Expect( this.driver, gutenbergEditorType );

			// The details button is not available on mobile
			if ( editor.screenSize === 'mobile' ) {
				return this.skip();
			}

			await editor.toggleDetails(); // Open details
			await editor.toggleDetails(); // Close details

			const eventsStack = await getEventsStack( this.driver );
			const toggleEvents = eventsStack.filter(
				( [ eventName ] ) => eventName === 'wpcom_block_editor_details_open'
			);
			assert.strictEqual( toggleEvents.length, 1 );
		} );
	}

	// This test should be last because it navigates the browser to another url
	if ( ! isSiteEditor ) {
		it( 'Tracks "wpcom_block_editor_post_publish_add_new_click" event', async function () {
			const editor = await EditorComponent.Expect( this.driver, gutenbergEditorType );

			await editor.publish( { addNew: true, waitForNavigation: false } );

			const eventsStack = await getEventsStack( this.driver );
			const clickEvents = eventsStack.filter(
				( [ eventName ] ) => eventName === 'wpcom_block_editor_post_publish_add_new_click'
			);
			assert.strictEqual( clickEvents.length, 1 );
		} );
	}
}
