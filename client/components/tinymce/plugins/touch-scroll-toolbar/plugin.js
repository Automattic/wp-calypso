/**
 * External dependencies
 */

import tinymce from 'tinymce/tinymce';
import { throttle } from 'lodash';

function touchScrollToolbar( editor ) {
	/**
	 * Capture and stop propagation on toolbar touch events. TinyMCE registers
	 * the `touchstart` event on buttons, redirecting them as `click` events to
	 * the button and preventing the default.
	 *
	 * @see https://github.com/tinymce/tinymce/blob/abffb85/js/tinymce/classes/ui/Button.js#L57-L60
	 */
	function disableToolbarTouchEvents() {
		editor.$( '.mce-toolbar:not(.mce-menubar)', document.body ).each( ( i, toolbar ) => {
			toolbar.addEventListener( 'touchstart', ( event ) => {
				event.stopImmediatePropagation();
			} );
		} );
	}

	/**
	 * Monitors the toolbar's `scroll` event, applying a `.is-scrolled-full`
	 * class if and only if the left scroll position has reached the element's
	 * maximum scroll offset.
	 */
	function hideToolbarFadeOnFullScroll() {
		editor
			.$( [
				editor.$( '.mce-inline-toolbar-grp .mce-container-body', document.body ),
				editor.$( '.mce-toolbar-grp', editor.theme.panel.getEl() ),
			] )
			.each( ( i, toolbar ) => {
				toolbar.on(
					'scroll',
					throttle( ( { target } ) => {
						let action;
						if ( target.scrollLeft === target.scrollWidth - target.clientWidth ) {
							action = 'add';
						} else if ( tinymce.DOM.hasClass( target, 'is-scrolled-full' ) ) {
							action = 'remove';
						}

						if ( action ) {
							const elements = editor.$( target );
							if ( ! elements.hasClass( 'mce-container-body' ) ) {
								elements.add( tinymce.DOM.getParent( target, '.mce-container-body' ) );
							}

							elements[ action + 'Class' ]( 'is-scrolled-full' );
						}
					}, 200 )
				);
			} );
	}

	/**
	 * Monitors the window resize event, assigning an `.is-scrollable` class to
	 * any toolbars for which horizontal scroll exists.
	 */
	function toggleToolbarsScrollableOnResize() {
		function toggleToolbarsScrollableClass() {
			editor.$( '.mce-toolbar-grp', editor.theme.panel.getEl() ).each( ( i, toolbar ) => {
				const isScrollable = toolbar.scrollWidth > toolbar.clientWidth;
				editor.$( toolbar ).toggleClass( 'is-scrollable', isScrollable );
			} );
		}

		window.addEventListener( 'resize', throttle( toggleToolbarsScrollableClass, 200 ) );
		toggleToolbarsScrollableClass();

		// Since some toolbars are hidden by default and report inaccurate
		// dimensions when forced to be shown, we instead bind to the event
		// when it's expected that they'll be visible
		editor.on( 'wptoolbar', ( event ) => {
			// Since an event handler is expected to set the toolbar property,
			// set a timeout to wait until the toolbar has been assigned
			setTimeout( () => {
				if ( ! event.toolbar || ! event.toolbar.visible() ) {
					return;
				}

				// For inline toolbars, the scrollable panel is the first child
				// of the toolbar, so we compare its width against the parent
				const toolbar = event.toolbar.getEl();
				const isScrollable = toolbar.firstChild.scrollWidth > toolbar.clientWidth;
				editor.dom.toggleClass( toolbar, 'is-scrollable', isScrollable );
			}, 0 );
		} );
	}

	editor.on( 'init', function () {
		disableToolbarTouchEvents();
		hideToolbarFadeOnFullScroll();
		toggleToolbarsScrollableOnResize();
	} );
}

export default function () {
	tinymce.PluginManager.add( 'wpcom/touchscrolltoolbar', touchScrollToolbar );
}
