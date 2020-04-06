/**
 * External dependencies
 */
import tinymce from 'tinymce/tinymce';
import closest from 'component-closest';
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import { gaRecordEvent } from 'lib/analytics/ga';
import { bumpStat } from 'lib/analytics/mc';
import { getCurrentUserLocale } from 'state/current-user/selectors';

const debug = debugModule( 'calypso:posts:stats' );

const shouldBumpStat = Math.random() <= 0.01 || process.env.NODE_ENV === 'development';

function recordTinyMCEButtonClick( buttonName ) {
	if ( shouldBumpStat ) {
		bumpStat( 'editor-button', 'calypso_' + buttonName );
	}
	gaRecordEvent( 'Editor', 'Clicked TinyMCE Button', buttonName );
	debug( 'TinyMCE button click', buttonName, 'mc=', shouldBumpStat );
}

function editorButtonAnalytics( editor ) {
	function editorEventAncestor( event, selector ) {
		return closest( event.target, selector, editor.container );
	}

	/**
	 * Capture and record button click events on the editor formatting buttons.
	 * Does not include the format dropdown or clicking the
	 * foreground color button to apply the previously selected foreground
	 * color.  These items are handled separately below.
	 */
	Object.keys( editor.buttons ).forEach( buttonName => {
		const button = editor.buttons[ buttonName ];
		const onPostRender = button.onPostRender;
		button.onPostRender = function() {
			this.on( 'click', event => {
				let eventName = buttonName.replace( /^(wp|wpcom)_/, '' );

				if ( buttonName === 'forecolor' ) {
					if ( editorEventAncestor( event, '.mce-open' ) ) {
						eventName = 'forecolor_toggle';
					} else if ( editorEventAncestor( event, '.mce-custom-color-btn' ) ) {
						eventName = 'forecolor_pick_custom';
					} else if ( editorEventAncestor( event, '.mce-colorbtn-trans' ) ) {
						eventName = 'forecolor_remove';
					} else {
						eventName = 'forecolor_pick_color';
					}
				}

				recordTinyMCEButtonClick( eventName );
			} );

			if ( typeof onPostRender === 'function' ) {
				onPostRender.apply( this, Array.prototype.slice.call( arguments ) );
			}
		};
	} );

	/*
	 * Track clicks on a couple of odd controls that aren't caught above.
	 * Using `document.body` because the format dropdown menu is a direct child
	 * of `document.body` (not a descendant of `editor.container`).
	 */
	function trackBodyClick( event ) {
		if (
			editorEventAncestor( event, '.mce-colorbutton' ) &&
			! editorEventAncestor( event, '.mce-open' )
		) {
			// This could be a click on the foreground color button to apply
			// the previously selected foreground color.  Unfortunately this
			// line is never executed - there must be another event handler
			// keeping the event from bubbling up.
			recordTinyMCEButtonClick( 'forecolor_pick_current' );
		} else if ( editorEventAncestor( event, '.mce-listbox' ) ) {
			// This is a click on the format dropdown button
			recordTinyMCEButtonClick( 'format_dropdown' );
		} else if ( closest( event.target, '.mce-menu-item' ) ) {
			// This is a menu item in the format dropdown.  Only track which
			// specific item is clicked for english interfaces - the easiest
			// way to determine which item is selected is by UI text.
			const reduxStore = editor.getParam( 'redux_store' );
			const locale = reduxStore ? getCurrentUserLocale( reduxStore.getState() ) : 'en';
			if ( locale === 'en' ) {
				const text = closest( event.target, '.mce-menu-item' ).textContent;
				const menuItemName = text
					.toLowerCase()
					.trim()
					.replace( /[^a-z0-9]+/g, '_' );
				recordTinyMCEButtonClick( 'format_dropdown_' + menuItemName );
			} else {
				recordTinyMCEButtonClick( 'format_dropdown_non_english' );
			}
		}
	}

	editor.on( 'init', () => {
		editor.dom.bind( document.body, 'click', trackBodyClick );
	} );

	editor.on( 'remove', () => {
		editor.dom.unbind( document.body, 'click', trackBodyClick );
	} );
}

export default function() {
	tinymce.PluginManager.add( 'wpcom/editorbuttonanalytics', editorButtonAnalytics );
}
