/**
 * External dependencies
 */
import { isWithinBreakpoint } from '@automattic/viewport';
import tinymce from 'tinymce/tinymce';
import { throttle } from 'lodash';

/**
 * TinyMCE plugin for toggling an `is-pinned` class on the editor container
 * when the viewport scroll position exceeds the top edge of the container.
 *
 * @param {object} editor TinyMCE editor instance
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
	 * Updates the pinned state, toggling the container class as appropriate.
	 *
	 * @param {boolean} toBePinned Whether toolbar should be pinned
	 */
	function togglePinned( toBePinned ) {
		isPinned = toBePinned;
		editor.dom.toggleClass( container, 'is-pinned', isPinned );
	}

	/**
	 * Checks whether the current pinned state of the editor should change,
	 * toggling the class as determined by the current viewport compared to the
	 * top edge of the container.
	 */
	const pinToolbarOnScroll = throttle( () => {
		if ( ! container ) {
			return;
		}

		if ( isPinned && window.pageYOffset < container.offsetTop ) {
			// Scroll doesn't reach container top and should be unpinned
			togglePinned( false );
		} else if ( ! isPinned && window.pageYOffset > container.offsetTop ) {
			// Scroll exceeds container top and should be pinned
			togglePinned( true );
		}
	}, 50 );

	/**
	 * Binds or unbinds the scroll event from the global window object, since
	 * pinning behavior is restricted to larger viewports whilst the visual
	 * editing mode is active.
	 */
	const maybeBindScroll = throttle( ( event ) => {
		const isVisual = ! editor.isHidden();
		const shouldBind = 'remove' !== event.type && isVisual && isWithinBreakpoint( '>660px' );

		if ( shouldBind === isMonitoringScroll ) {
			// Window event binding already matches expectation, so skip
			return;
		}

		const eventBindFn = ( shouldBind ? 'add' : 'remove' ) + 'EventListener';
		window[ eventBindFn ]( 'scroll', pinToolbarOnScroll );

		isMonitoringScroll = shouldBind;
		if ( isMonitoringScroll ) {
			setContainer();

			// May need to pin if resizing from small to large viewport
			pinToolbarOnScroll();
		} else {
			// Reset to default when not monitoring scroll
			togglePinned( false );
		}
	}, 200 );

	editor.on( 'init show hide remove', maybeBindScroll );
	window.addEventListener( 'resize', maybeBindScroll );
}

export default function () {
	tinymce.PluginManager.add( 'wpcom/toolbarpin', toolbarPin );
}
