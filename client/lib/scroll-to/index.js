/** @format */

/**
 * External dependencies
 */

import TWEEN from 'tween.js';
import { defer } from 'lodash';
import React from 'react';
import ReactDom from 'react-dom';

function getCurrentScroll( container ) {
	if ( container && container.scrollTop !== undefined ) {
		return {
			x: container.scrollLeft,
			y: container.scrollTop,
		};
	}

	const x = window.pageXOffset || document.documentElement.scrollLeft,
		y = window.pageYOffset || document.documentElement.scrollTop;
	return { x: x, y: y };
}

function makeScrollUpdater( container ) {
	container = container && container.scrollTop !== undefined ? container : window;

	return function updateScroll() {
		if ( container === window ) {
			container.scrollTo( this.x, this.y );
		} else {
			container.scrollTop = this.y;
			container.scrollLeft = this.x;
		}
	};
}

function animate() {
	if ( ! TWEEN.getAll().length ) {
		return;
	}

	if ( 'undefined' !== typeof window && window.requestAnimationFrame ) {
		window.requestAnimationFrame( animate );
	} else {
		defer( animate );
	}

	TWEEN.update();
}

/**
 * Scrolls to the specified window location
 * @param {Object} options - options object (see below)
 * @param {number} options.x - desired left or x coordinate
 * @param {number} options.y - desired top or y coordinate
 * @param {function} options.easing - easing function, defaults to TWEEN.Easing.Circular.Out
 * @param {number} options.duration - duration in ms, default 500
 * @param {function} options.onStart - callback before start is called
 * @param {function} options.onComplete - callback when scroll is finished
 * @param {HTMLElement} options.container - the container to scroll instead of window, if any
 */
function scrollTo( options ) {
	const currentScroll = getCurrentScroll( options.container ),
		tween = new TWEEN.Tween( currentScroll )
			.easing( options.easing || TWEEN.Easing.Circular.Out )
			.to( { x: options.x, y: options.y }, options.duration || 500 )
			.onUpdate( makeScrollUpdater( options.container ) );

	if ( options.onStart ) {
		tween.onStart( options.onStart );
	}
	if ( options.onComplete ) {
		tween.onComplete( options.onComplete );
	}
	if ( TWEEN.getAll().length === 0 ) {
		tween.start();
		animate();
	} else {
		tween.start();
	}
}

/**
 * Scroll to the wrapped component if the page has a URL anchor like #namedAnchor
 *
 * @param {React.Component} WrappedComponent - the component to scroll to
 * @param {string} namedAnchor - the anchor name
 * @returns {React.Component} - the component with scrollTo behaviour enabled
 */
function scrollToComponent( WrappedComponent, namedAnchor ) {
	return class extends React.Component {
		componentDidMount() {
			this.checkForAnchor();

			// If we have a comment anchor, scroll to comments
			if ( this.hasAnchor && ! this.hasScrolledToAnchor ) {
				this.scrollToAnchor();
			}
		}

		// Does the URL contain the anchor #{namedAnchor}? If so, scroll to the section if we're not already there.
		checkForAnchor = () => {
			const hash = window.location.hash.substr( 1 );
			if ( hash === namedAnchor ) {
				this.hasAnchor = true;
			}
		};

		// Scroll to the top of the section.
		scrollToAnchor = () => {
			if ( this._scrolling ) {
				return;
			}

			this._scrolling = true;
			setTimeout( () => {
				const componentNode = ReactDom.findDOMNode( this.wrappedComponentInstance );
				if ( componentNode && componentNode.offsetTop ) {
					scrollTo( {
						x: 0,
						y: componentNode.offsetTop - 48,
						duration: 300,
						onComplete: () => {
							// check to see if the comment node moved while we were scrolling
							// and scroll to the end position
							const componentNodeAfterScroll = ReactDom.findDOMNode(
								this.wrappedComponentInstance
							);
							if ( componentNodeAfterScroll && componentNodeAfterScroll.offsetTop ) {
								window.scrollTo( 0, componentNodeAfterScroll.offsetTop - 48 );
							}
							this._scrolling = false;
						},
					} );
					if ( this.hasAnchor ) {
						this.hasScrolledToAnchor = true;
					}
				}
			}, 0 );
		};

		getRefName() {
			return namedAnchor + '_component';
		}

		render() {
			// ... and renders the wrapped component with the fresh data!
			// Notice that we pass through any additional props
			return (
				<WrappedComponent
					ref={ function( wrapped ) {
						this.wrappedComponentInstance = wrapped;
					} }
					{ ...this.props }
				/>
			);
		}
	};
}

export { scrollToComponent };
export default scrollTo;
