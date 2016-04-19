/**
 * External dependencies
 */
import tinymce from 'tinymce/tinymce';
import throttle from 'lodash/throttle';

/**
 * Internal dependencies
 */
import { isWithinBreakpoint } from 'lib/viewport';

/**
 * TinyMCE plugin for toggling an `is-pinned` class on the editor container
 * when the viewport scroll position exceeds the top edge of the container.
 *
 * @param {Object} editor TinyMCE editor instance
 */
function toolbarPin( editor ) {
	let isMonitoringScroll = false,
		isPinned = false,
		container;

	/**
	 * Assigns the container top-level variable to the current container.
	 */
	function setContainer() {
		container = editor.getContainer();
	}

	/**
	 * Checks whether the current pinned state of the editor should change,
	 * toggling the class as determined by the current viewport compared to the
	 * top edge of the container.
	 */
	function pinToolbarOnScroll() {
		if ( ! container ) {
			return;
		}

		if ( ! isWithinBreakpoint( '>660px' ) ) {
			// We might be here due to a window resize to a small viewport
			isPinned = false;
		} else if ( isPinned && window.scrollY < container.offsetTop ) {
			// Scroll doesn't reach container top and should be unpinned
			isPinned = false;
		} else if ( ! isPinned && window.scrollY > container.offsetTop ) {
			// Scroll exceeds container top and should be pinned
			isPinned = true;
		} else {
			// If we've reached this point, assume that no change is necessary
			return;
		}

		editor.dom.toggleClass( container, 'is-pinned', isPinned );
	}
	const maybePinToolbarOnScroll = throttle( pinToolbarOnScroll, 50 );

	/**
	 * Binds or unbinds the scroll event from the global window object, since
	 * pinning behavior is restricted to larger viewports whilst the visual
	 * editing mode is active.
	 */
	function bindScroll( event ) {
		const isVisual = ! editor.isHidden();
		const shouldBind = 'remove' !== event.type && isVisual && isWithinBreakpoint( '>660px' );

		if ( shouldBind === isMonitoringScroll ) {
			// Window event binding already matches expectation, so skip
			return;
		}

		const eventBindFn = ( shouldBind ? 'add' : 'remove' ) + 'EventListener';
		window[ eventBindFn ]( 'scroll', maybePinToolbarOnScroll );

		isMonitoringScroll = shouldBind;
		if ( isMonitoringScroll ) {
			setContainer();
		}
	}
	const maybeBindScroll = throttle( bindScroll, 200 );

	editor.on( 'init show hide remove', maybeBindScroll );

	let isLargeViewport = isWithinBreakpoint( '>660px' );
	window.addEventListener( 'resize', () => {
		const wasLargeViewport = isLargeViewport;
		isLargeViewport = isWithinBreakpoint( '>660px' );
		if ( wasLargeViewport !== isLargeViewport ) {
			bindScroll();
			pinToolbarOnScroll();
		} else {
			maybeBindScroll();
		}
	} );
}

export default function() {
	tinymce.PluginManager.add( 'wpcom/toolbarpin', toolbarPin );
}
