/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './index.scss';

/**
 * Creates a ScrollLock component bound to the specified document.
 *
 * This function creates a ScrollLock component for the specified document
 * and is exposed so we can create an isolated component for unit testing.
 *
 * @param {Object} args Keyword args.
 * @param {HTMLDocument} args.htmlDocument The document to lock the scroll for.
 * @param {string} args.className The name of the class used to lock scrolling.
 * @return {Component} The bound ScrollLock component.
 */
export function createScrollLockComponent( {
	htmlDocument = document,
	className = 'lockscroll',
} = {} ) {
	let lockCounter = 0;

	/*
	 * Setting `overflow: hidden` on html and body elements resets body scroll in iOS.
	 * Save scroll top so we can restore it after locking scroll.
	 *
	 * NOTE: It would be cleaner and possibly safer to find a localized solution such
	 * as preventing default on certain touchmove events.
	 */
	let previousScrollTop = 0;

	/**
	 * Locks and unlocks scroll depending on the boolean argument.
	 *
	 * @param {boolean} locked Whether or not scroll should be locked.
	 */
	function setLocked( locked ) {
		const scrollingElement = htmlDocument.scrollingElement || htmlDocument.body;

		if ( locked ) {
			previousScrollTop = scrollingElement.scrollTop;
		}

		const methodName = locked ? 'add' : 'remove';
		scrollingElement.classList[ methodName ]( className );

		// Adding the class to the document element seems to be necessary in iOS.
		htmlDocument.documentElement.classList[ methodName ]( className );

		if ( ! locked ) {
			scrollingElement.scrollTop = previousScrollTop;
		}
	}

	/**
	 * Requests scroll lock.
	 *
	 * This function tracks requests for scroll lock. It locks scroll on the first
	 * request and counts each request so `releaseLock` can unlock scroll when
	 * all requests have been released.
	 */
	function requestLock() {
		if ( lockCounter === 0 ) {
			setLocked( true );
		}

		++lockCounter;
	}

	/**
	 * Releases a request for scroll lock.
	 *
	 * This function tracks released requests for scroll lock. When all requests
	 * have been released, it unlocks scroll.
	 */
	function releaseLock() {
		if ( lockCounter === 1 ) {
			setLocked( false );
		}

		--lockCounter;
	}

	return class ScrollLock extends Component {
		/**
		 * Requests scroll lock on mount.
		 */
		componentDidMount() {
			requestLock();
		}
		/**
		 * Releases scroll lock before unmount.
		 */
		componentWillUnmount() {
			releaseLock();
		}

		/**
		 * Render nothing as this component is merely a way to declare scroll lock.
		 *
		 * @return {null} Render nothing by returning `null`.
		 */
		render() {
			return null;
		}
	};
}

export default createScrollLockComponent();
