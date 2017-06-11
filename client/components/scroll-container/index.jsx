/**
 * External Dependencies
 */
import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';
import { debounce, throttle } from 'lodash';

// tween.js has references to window on its initial run. So, if that doesn't exist,
// we don't want to import that library.
let TWEEN = {};
if ( typeof window !== 'undefined' ) {
	TWEEN = require( 'tween.js' );
}

/**
 * Internal Dependencies
 */
import ScrollTrack from './ScrollTrack';
import { BASE_CLASS } from './helpers/constants';
import { throttleToFrame, eventInsideRect } from './helpers/events';
import { calcPuckSize, calcPuckOffset, getScrollbarClipWidth, scrollbarHasLayout } from './helpers/dimensions';

/**
 * This component will wrap content and create custom scroll bars for said content.  Due to requirements
 * for automatically fading content in and out, Webkit's CSS customization for scroll bars can not be
 * used.
 *
 * @export
 * @class ScrollContainer
 * @extends {PureComponent}
 */
export default class ScrollContainer extends PureComponent {
	static propTypes = {
		autoHide: PropTypes.bool,
		children: PropTypes.node,
		className: PropTypes.string,
	};

	static defaultProps = {
		autoHide: false,
	};

	constructor( props ) {
		super( props );
		this.state = {
			canScrollVertical: false,
			draggingPuck: false,
			forceVisible: ! this.props.autoHide,
			isVerticalPuckHovered: false,
			verticalPuckOffset: 0,
			verticalPuckSize: 0,
			isVerticalTrackHovered: false,
		};
		this.verticalTrackRect = null;
		this.verticalTrackMargin = 0;

		this.contentContainerRefFn = n => this.contentContainer = n;
		this.horizontalTrackRefFn = c => this.horizontalTrack = c;
		this.rootNodeRefFn = n => this.rootNode = n;
		this.verticalTrackRefFn = c => this.verticalTrack = c;

		this.contentScrollHandler = throttleToFrame( () => {
			this.updatePuckPosition();
			this.scrollComplete();
		} );
		this.contentUpdateHandler = throttle( () => {
			this.canScroll();
			this.calculateTrackRectangles();
			this.updatePuck();
		}, 100, { leading: false } );
		this.coordinatesOverTrack = throttleToFrame( this.coordinatesOverTrack );
		this.scrollByDragging = throttleToFrame( this.scrollByDragging );
		this.scrollComplete = debounce( this.autoHideAfterScroll, 333, { leading: true, trailing: true } );
		this.windowResizeHandler = throttleToFrame( () => {
			this.canScroll();
			this.calculateTrackRectangles();
			this.updatePuck();
		} );
		this.windowScrollHandler = debounce( () => {
			if ( this.verticalTrackRect != null ) {
				this.updateScrollbar();
			}
		}, 100 );

		this.dragPuck = event => {
			const { clientX, clientY } = event;
			this.scrollByDragging( clientX, clientY );
		};
		this.trackMouseOnHover = event => {
			const { clientX, clientY } = event;
			this.coordinatesOverTrack( clientX, clientY );
		};
	}

	componentDidMount = () => {
		if ( typeof window !== 'undefined' ) {
			window.addEventListener( 'resize', this.windowResizeHandler );
		}
		this.updateScrollbar();
	}

	componentDidUpdate( prevProps, prevState ) {
		if (
			prevState.isVerticalTrackHovered !== this.state.isVerticalTrackHovered ||
			prevState.horizontalTrackHovered !== this.state.horizontalTrackHovered
		) {
			this.calculateTrackRectangles();
		}

		if ( typeof window !== 'undefined' && prevState.draggingPuck !== this.state.draggingPuck ) {
			if ( this.state.draggingPuck ) {
				window.addEventListener( 'mousemove', this.dragPuck );
				window.addEventListener( 'mouseup', this.stopDragging );
			} else {
				window.removeEventListener( 'mousemove', this.dragPuck );
				window.removeEventListener( 'mouseup', this.stopDragging );
			}
		}

		if ( prevProps.children !== this.props.children ) {
			this.updateScrollbar();
		}
	}

	componentWillUnmount = () => {
		if ( typeof window !== 'undefined' ) {
			window.removeEventListener( 'mousemove', this.dragPuck );
			window.removeEventListener( 'mouseup', this.stopDragging );
			window.removeEventListener( 'resize', this.windowResizeHandler );
		}

		// Just to be safe
		this.stopScrolling();

		/*
		There's a possibility that since these functions are the result of currying
		another function which has the initial function which is boudn to the component
		instance in the scope chain, the curried function will keep the component in
		memory even after the component is unmounted.  Since this is inexpensive,
		let's just cancel (if possible) and assign over these to prevent memory leaks.
		*/
		this.contentScrollHandler = null;
		this.contentUpdateHandler.cancel();
		this.contentUpdateHandler = null;
		this.coordinatesOverTrack = null;
		this.scrollByDragging = null;
		this.scrollComplete.cancel();
		this.scrollComplete = null;
		this.windowResizeHandler = null;
		this.windowScrollHandler.cancel();
		this.windowScrollHandler = null;
	}

	autoHideAfterScroll = () => {
		if ( this.props.autoHide && ! this.state.draggingPuck ) {
			this.setState( () => ( { forceVisible: false } ) );
		}
	}

	calculateTrackRectangles = () => {
		if ( this.state.canScrollVertical && this.verticalTrack != null ) {
			const verticalTrackRect = this.verticalTrack.getBoundingClientRect();
			if ( verticalTrackRect.width > 0 ) {
				const margin = parseInt( window.getComputedStyle( this.verticalTrack ).marginTop, 10 );
				this.verticalTrackRect = verticalTrackRect;
				this.verticalTrackMargin = ! isNaN( margin ) && isFinite( margin ) ? margin : 0;
			}
			this.clientHeight = this.contentContainer.clientHeight;
			this.scrollHeight = this.contentContainer.scrollHeight;
		}
	}

	canScroll = () => {
		const content = this.contentContainer;
		this.setState( () => ( {
			canScrollVertical: content.clientHeight < content.scrollHeight,
		} ) );
	}

	clearTrackState = () => {
		this.clientHeight = null;
		this.scrollHeight = null;
		this.verticalTrackMargin = null;
		this.verticalTrackRect = null;
		this.setState( () => ( {
			draggingPuck: false,
			isVerticalPuckHovered: false,
			isVerticalTrackHovered: false,
		} ) );
	}

	/**
	 * Determine if a given set of X/Y client coordinates is on top of a visible scrollbar track.
	 *
	 * @private
	 * @param {Number} x - X Coordinate
	 * @param {Number} y - Y Coordinate
	 * @memberof ScrollContainer
	 */
	coordinatesOverTrack = ( x, y ) => {
		this.setState( state => {
			if ( this.verticalTrackRect == null ) {
				this.calculateTrackRectangles();
			}
			const { verticalTrackRect } = this;
			const fakeEvent = { clientX: x, clientY: y };
			const newState = {};
			if ( state.canScrollVertical ) {
				newState.isVerticalTrackHovered = verticalTrackRect == null ? false : eventInsideRect( fakeEvent, verticalTrackRect );
				newState.isVerticalPuckHovered = false;
				if ( newState.isVerticalTrackHovered ) {
					const puckTop = verticalTrackRect.top + state.verticalPuckOffset;
					newState.isVerticalPuckHovered = y >= puckTop && y <= puckTop + state.verticalPuckSize;
				}
			}

			if ( state.isVerticalTrackHovered !== newState.isVerticalTrackHovered ) {
				this.calculateTrackRectangles();
			}
			return newState;
		} );
	}

	/**
	 * Scroll the content based on the current clientX and clientY of the mouse.
	 *
	 * @param {Number} clientX - X coordinate of the mouse with (0, 0) at the top left of the window
	 * @param {Number} clientY - Y coordinate of the mouse with (0, 0) at the top left of the window
	 * @memberof ScrollContainer
	 */
	scrollByDragging = ( clientX, clientY ) => {
		const { clientHeight, scrollHeight } = this;
		const trackDiff = clientY - this.state.dragStartPosition;
		const scrollDiff = scrollHeight / clientHeight * trackDiff;
		this.contentContainer.scrollTop = this.state.startingScrollPosition + scrollDiff;
	}

	/**
	 * After scrolling has completed, prevent a click event from landing on the content,
	 * reset dragging state, and execute mouseleave handlers if the mouse is no longer
	 * inside of this container.
	 *
	 * @param {MouseEvent} event - The mouseup event which caused scrolling to stop.
	 * @memberof ScrollContainer
	 */
	stopDragging = event => {
		event.preventDefault();
		event.stopPropagation();
		if ( ! this.rootNode.contains( event.target ) ) {
			this.clearTrackState();
		}
		this.setState( {
			draggingPuck: false,
			dragStartPosition: null,
			forceVisible: false,
			startingScrollPosition: null,
		} );
	}

	/**
	 * If the user clicks on a scroll track, but outside of its associated scroll puck,
	 * we need to either increase or decrease the amount of scrolling by a single "page".
	 *
	 * @private
	 * @param {MouseEvent} event - The mouse event triggered in the UI
	 * @memberof ScrollContainer
	 */
	scrollIfClickOnTrack = event => {
		const { clientY } = event;
		const { verticalTrackRect } = this;

		if ( verticalTrackRect != null && eventInsideRect( event, verticalTrackRect ) ) {
			event.preventDefault();
			event.stopPropagation();
			const { scrollLeft, scrollTop } = this.contentContainer;
			const { verticalPuckOffset, verticalPuckSize } = this.state;
			const clickedBelowPuck = clientY > verticalTrackRect.top + verticalPuckOffset + verticalPuckSize;
			const clickedAbovePuck = clientY < verticalTrackRect.top + verticalPuckOffset;
			if ( clickedAbovePuck || clickedBelowPuck ) {
				const scrollYTarget = clickedAbovePuck ? scrollTop - this.clientHeight : scrollTop + this.clientHeight;
				this.scrollTo( scrollLeft, scrollYTarget, () => this.setState( () => ( { isVerticalPuckHovered: true } ) ) );
			} else {
				this.setState( () => ( {
					draggingPuck: true,
					dragStartPosition: clientY,
					forceVisible: true,
					startingScrollPosition: scrollTop,
				} ) );
			}
		}
	}

	/**
	 * Scroll the contentes of this container to the given x/y coordinates.
	 *
	 * @public
	 * @param {Number} x - The amount of desired horizontal scrolling
	 * @param {Number} y - The amount of desired vertical scrolling
	 * @param {Function} [cb] - Callback to execute after scrolling
	 * @memberof ScrollContainer
	 */
	scrollTo = ( x, y, cb ) => {
		if ( this.scrollTween != null ) {
			this.scrollTween.stop();
		}
		this.setState( () => ( { scrolling: true } ), () => {
			const scrollContainer = this;
			this.scrollTween = new TWEEN.Tween( {
				x: this.contentContainer.scrollLeft || 0,
				y: this.contentContainer.scrollTop || 0,
			} )
			.to( {
				x: Math.max( x || 0, 0 ),
				y: Math.max( y || 0, 0 ),
			}, 75 )
			.onUpdate( function() {
				scrollContainer.contentContainer.scrollTop = this.y;
				scrollContainer.contentContainer.scrollLeft = this.x;
			} )
			.easing( TWEEN.Easing.Linear.None )
			.interpolation( TWEEN.Interpolation.Bezier )
			.onComplete( () => {
				this.stopScrolling();
				if ( typeof cb === 'function' ) {
					cb();
				}
			} )
			.start();
			const tweenUpdateFn = time => {
				if ( this.state.scrolling ) {
					TWEEN.update( time );
					requestAnimationFrame( tweenUpdateFn );
				}
			};
			requestAnimationFrame( tweenUpdateFn );
		} );
	}

	/**
	 * If the mouse is on top of the track, we have to manually stop the event from
	 * landing on the underlying content since the track doesn't accept pointer events.
	 *
	 * @param {MouseEvent} event - The click event we might need to kill.
	 * @memberof ScrollContainer
	 */
	stopClickOnTrackOver = event => {
		if ( this.state.isVerticalTrackHovered ) {
			event.preventDefault();
			event.stopPropagation();
		}
	}

	stopScrolling = () => {
		if ( this.scrollTween != null ) {
			this.scrollTween.stop();
		}
		this.setState( () => ( { scrolling: false } ) );
	}

	updateScrollbar = () => {
		this.canScroll();
		this.calculateTrackRectangles();
		this.updatePuck();
	}

	updatePuck = () => {
		this.updatePuckSize();
		this.updatePuckPosition();
	}

	updatePuckPosition = () => {
		this.setState( state => {
			if ( state.canScrollVertical ) {
				const { scrollHeight, clientHeight, scrollTop } = this.contentContainer;
				return {
					verticalPuckOffset: calcPuckOffset( clientHeight, scrollHeight, scrollTop, this.verticalTrackMargin ),
				};
			}
			return null;
		} );
	}

	updatePuckSize = () => {
		this.setState( state => {
			if ( state.canScrollVertical ) {
				const { scrollHeight, clientHeight } = this.contentContainer;
				return {
					verticalPuckSize: calcPuckSize( clientHeight, scrollHeight, this.verticalTrackMargin ),
				};
			}
			return null;
		} );
	}

	render() {
		const { className, autoHide, children } = this.props;
		const { canScrollVertical } = this.state;
		const {
			draggingPuck,
			forceVisible,
			scrolling,
			isVerticalPuckHovered,
			verticalPuckOffset,
			verticalPuckSize,
			isVerticalTrackHovered,
		} = this.state;

		const scrollbarCipWidth = `${ getScrollbarClipWidth() }px`;
		const scrollbarClipStyles = {
			marginRight: `-${ scrollbarCipWidth }`,
			paddingRight: scrollbarHasLayout() ? null : scrollbarCipWidth,
		};

		const classes = classnames( BASE_CLASS, `${ BASE_CLASS }__vertical`, className, {
			[ `${ BASE_CLASS }-autohide` ]: autoHide,
			[ `${ BASE_CLASS }-dragging` ]: draggingPuck,
			[ `${ BASE_CLASS }__force-visible` ]: forceVisible,
		} );
		return (
			<div
				ref={ this.rootNodeRefFn }
				className={ classes }
				onMouseEnter={ this.calculateTrackRectangles }
				onMouseLeave={ draggingPuck ? null : this.clearTrackState }
			>
				<div
					ref={ this.contentContainerRefFn }
					className={ `${ BASE_CLASS }__content-container` }
					onScroll={ this.contentScrollHandler }
					onClick={ this.contentUpdateHandler }
					onClickCapture={ this.stopClickOnTrackOver }
					onKeyDown={ this.contentUpdateHandler }
					onMouseDownCapture={ this.scrollIfClickOnTrack }
					onMouseMove={ scrolling || draggingPuck ? null : this.trackMouseOnHover }
					style={ scrollbarClipStyles }
				>
					{ children }
				</div>
				{
					canScrollVertical
					? <ScrollTrack
						direction="vertical"
						refFn={ this.verticalTrackRefFn }
						puckHovered={ isVerticalPuckHovered }
						puckOffset={ verticalPuckOffset }
						puckSize={ verticalPuckSize }
						trackHovered={ isVerticalTrackHovered }
					/>
					: null
				}
			</div>
		);
	}
}
