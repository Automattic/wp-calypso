/** @format */

/**
 * External dependencies
 */

import debugFactory from 'debug';
import { noop, omit } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDom from 'react-dom';
import afterLayoutFlush from 'lib/after-layout-flush';

/**
 * Internal dependencies
 */
import detectHistoryNavigation from 'lib/detect-history-navigation';
import ScrollStore from './scroll-store';
import scrollTo from 'lib/scroll-to';
import smartSetState from 'lib/react-smart-set-state';

const debug = debugFactory( 'calypso:infinite-list' );

export default class InfiniteList extends React.Component {
	static propTypes = {
		items: PropTypes.array.isRequired,
		fetchingNextPage: PropTypes.bool.isRequired,
		lastPage: PropTypes.bool.isRequired,
		guessedItemHeight: PropTypes.number.isRequired,
		itemsPerRow: PropTypes.number,
		fetchNextPage: PropTypes.func.isRequired,
		getItemRef: PropTypes.func.isRequired,
		renderItem: PropTypes.func.isRequired,
		renderLoadingPlaceholders: PropTypes.func.isRequired,
		renderTrailingItems: PropTypes.func,
		context: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
	};

	static defaultProps = {
		itemsPerRow: 1,
		renderTrailingItems: noop,
	};

	lastScrollTop = -1;
	scrollRAFHandle = false;
	isScrolling = false;
	_isMounted = false;
	smartSetState = smartSetState;

	constructor( ...args ) {
		super( ...args );

		const url = page.current;
		let newState, scrollTop;

		if ( detectHistoryNavigation.loadedViaHistory() ) {
			newState = ScrollStore.getPositions( url );
			scrollTop = ScrollStore.getScrollTop( url );
		}

		if ( newState && scrollTop ) {
			debug( 'overriding scrollTop:', scrollTop );
			newState.scrollTop = scrollTop;
		}

		this.initScrolling();
		if ( this._contextLoaded() ) {
			this._scrollContainer = this.props.context || window;
			this.updateContextHeight( this.getCurrentContextHeight() );
		}

		if ( newState ) {
			debug( 'infinite-list positions loaded from store' );
		} else {
			debug( 'infinite-list positions reset for new list' );
			newState = {
				firstRenderedIndex: 0,
				topPlaceholderHeight: 0,
				lastRenderedIndex: this.initialLastRenderedIndex(),
				bottomPlaceholderHeight: 0,
				scrollTop: 0,
			};
		}
		debug( 'infinite list mounting', newState );
		this.state = newState;
	}

	componentDidMount() {
		this._isMounted = true;
		if ( this._contextLoaded() ) {
			this._setContainerY( this.state.scrollTop );
		}

		// only override browser history scroll if navigated via history
		if ( detectHistoryNavigation.loadedViaHistory() ) {
			this._overrideHistoryScroll();
		}
		debug( 'setting scrollTop:', this.state.scrollTop );
		this.forcedScrollUpdate();
		if ( this._contextLoaded() ) {
			this._scrollContainer.addEventListener( 'scroll', this.onScroll );
		}
	}

	componentDidUpdate( prevProps ) {
		if ( ! this._contextLoaded() ) {
			return;
		}

		if ( this.props.context !== prevProps.context ) {
			// remove old listener
			if ( this._scrollContainer ) {
				this._scrollContainer.removeEventListener( 'scroll', this._resetScroll );
				this._scrollContainer.removeEventListener( 'scroll', this.onScroll );
			}

			// add new listeners
			this._scrollContainer = this.props.context || window;
			this._scrollContainer.addEventListener( 'scroll', this.onScroll );

			// only override browser history scroll if navigated via history
			if ( detectHistoryNavigation.loadedViaHistory() ) {
				this._overrideHistoryScroll();
			}
		}

		// we may have guessed item heights wrong - now we have real heights
		if ( ! this.isScrolling ) {
			this.cancelAnimationFrame();
			this.forcedScrollUpdate();
		}
	}

	// Instance method that is called externally (via a ref) by a parent component
	reset() {
		this.cancelAnimationFrame();

		this.initScrolling();
		if ( this._contextLoaded() ) {
			this._scrollContainer = this.props.context || window;
			this.updateContextHeight( this.getCurrentContextHeight() );
		}

		this.isScrolling = false;

		this.setState( {
			firstRenderedIndex: 0,
			topPlaceholderHeight: 0,
			lastRenderedIndex: this.initialLastRenderedIndex(),
			bottomPlaceholderHeight: 0,
			scrollTop: 0,
		} );
	}

	componentWillUnmount() {
		this._scrollContainer.removeEventListener( 'scroll', this.onScroll );
		this._scrollContainer.removeEventListener( 'scroll', this._resetScroll );
		this.cancelAnimationFrame();
		this.forcedScrollUpdate.cancel();
		this._isMounted = false;
	}

	cancelAnimationFrame() {
		if ( this.scrollRAFHandle ) {
			window.cancelAnimationFrame( this.scrollRAFHandle );
			this.scrollRAFHandle = null;
		}
		this.lastScrollTop = -1;
	}

	forcedScrollUpdate = afterLayoutFlush( () =>
		this.updateScroll( {
			triggeredByScroll: false,
		} )
	);

	onScroll = () => {
		if ( this.isScrolling ) {
			return;
		}
		if ( ! this.scrollRAFHandle && this.getCurrentScrollTop() !== this.lastScrollTop ) {
			this.scrollRAFHandle = window.requestAnimationFrame( this.scrollChecks );
		}
	};

	getCurrentContextHeight() {
		const context = this.props.context || window.document.documentElement;
		return context.clientHeight;
	}

	getCurrentScrollTop() {
		if ( this.props.context ) {
			debug( 'getting scrollTop from context' );
			return this.props.context.scrollTop;
		}
		return window.pageYOffset;
	}

	scrollChecks = () => {
		// isMounted is necessary to prevent running this before it is mounted,
		// which could be triggered by data-observe mixin.
		if ( ! this._isMounted || this.getCurrentScrollTop() === this.lastScrollTop ) {
			this.scrollRAFHandle = null;
			return;
		}
		this.updateScroll( {
			triggeredByScroll: true,
		} );
	};

	// Instance method that is called externally (via a ref) by a parent component
	scrollToTop() {
		this.cancelAnimationFrame();
		this.isScrolling = true;
		if ( this.props.context && this.props.context !== window ) {
			this.props.context.scrollTop = 0;
			this.updateScroll( { triggeredByScroll: false } );
			this.isScrolling = false;
		} else {
			scrollTo( {
				x: 0,
				y: 0,
				duration: 250,
				onComplete: () => {
					if ( this._isMounted ) {
						this.updateScroll( { triggeredByScroll: false } );
					}
					this.isScrolling = false;
				},
			} );
		}
	}

	updateScroll( options ) {
		const url = page.current;
		let newState;

		if ( ! this._contextLoaded() ) {
			return;
		}

		this.lastScrollTop = this.getCurrentScrollTop();
		ScrollStore.storeScrollTop( url, this.lastScrollTop );
		this.updateContextHeight( this.getCurrentContextHeight() );
		this.scrollPosition = this.lastScrollTop;
		this.triggeredByScroll = options.triggeredByScroll;
		this.updatePlaceholderDimensions();

		this.triggerScrollChanges( this.state );

		if ( this.stateUpdated ) {
			newState = {
				firstRenderedIndex: this.firstRenderedIndex,
				topPlaceholderHeight: this.topPlaceholderHeight,
				lastRenderedIndex: this.lastRenderedIndex,
				bottomPlaceholderHeight: this.bottomPlaceholderHeight,
				scrollTop: this.lastScrollTop,
			};

			// Force one more check on next animation frame,
			// item heights may have been guessed wrong.
			this.lastScrollTop = -1;

			debug( 'new scroll positions', newState, this.state );
			this.smartSetState( newState );
			ScrollStore.storePositions( url, newState );
		}

		this.scrollRAFHandle = window.requestAnimationFrame( this.scrollChecks );
	}

	boundsForRef = ref => {
		if ( ref in this.refs ) {
			return ReactDom.findDOMNode( this.refs[ ref ] ).getBoundingClientRect();
		}
		return null;
	};

	/**
	 * Returns a list of visible item indexes. This includes any items that are
	 * partially visible in the viewport. Instance method that is called externally
	 * (via a ref) by a parent component.
	 * @param {Object} options - offset properties
	 * @param {Integer} options.offsetTop - in pixels, 0 if unspecified
	 * @param {Integer} options.offsetBottom - in pixels, 0 if unspecified
	 * @returns {Array} This list of indexes
	 */
	getVisibleItemIndexes( options ) {
		const container = ReactDom.findDOMNode( this ),
			visibleItemIndexes = [],
			firstIndex = this.state.firstRenderedIndex,
			lastIndex = this.state.lastRenderedIndex,
			offsetTop = options && options.offsetTop ? options.offsetTop : 0;
		let windowHeight,
			rect,
			children,
			i,
			offsetBottom = options && options.offsetBottom ? options.offsetBottom : 0;

		offsetBottom = offsetBottom || 0;
		if ( lastIndex > -1 ) {
			// stored item heights are not reliable at all in scroll helper,
			// for this first pass, do bounds checks on children
			children = container.children;
			// skip over first and last child since these are spacers.
			for ( i = 1; i < children.length - 1; i++ ) {
				rect = container.children[ i ].getBoundingClientRect();
				windowHeight = window.innerHeight || document.documentElement.clientHeight;
				if (
					( rect.top < 0 && Math.abs( rect.top ) < rect.height - offsetTop ) ||
					( rect.top > 0 && rect.top < windowHeight - offsetBottom )
				) {
					visibleItemIndexes.push( {
						index: firstIndex + i - 1,
						bounds: rect,
					} );
				}
			}
		}
		return visibleItemIndexes;
	}

	render() {
		const propsToTransfer = omit( this.props, Object.keys( this.constructor.propTypes ) ),
			spacerClassName = 'infinite-list__spacer';
		let i,
			lastRenderedIndex = this.state.lastRenderedIndex,
			itemsToRender = [];

		if ( lastRenderedIndex === -1 || lastRenderedIndex > this.props.items.length - 1 ) {
			debug(
				'resetting lastRenderedIndex, currently at %s, %d items',
				lastRenderedIndex,
				this.props.items.length
			);
			lastRenderedIndex = Math.min(
				this.state.firstRenderedIndex + this.initialLastRenderedIndex(),
				this.props.items.length - 1
			);
			debug( 'reset lastRenderedIndex to %s', lastRenderedIndex );
		}

		debug( 'rendering %d to %d', this.state.firstRenderedIndex, lastRenderedIndex );

		for ( i = this.state.firstRenderedIndex; i <= lastRenderedIndex; i++ ) {
			itemsToRender.push( this.props.renderItem( this.props.items[ i ], i ) );
		}

		if ( this.props.fetchingNextPage ) {
			itemsToRender = itemsToRender.concat( this.props.renderLoadingPlaceholders() );
		}

		return (
			<div { ...propsToTransfer }>
				<div
					ref="topPlaceholder"
					className={ spacerClassName }
					style={ { height: this.state.topPlaceholderHeight } }
				/>
				{ itemsToRender }
				{ this.props.renderTrailingItems() }
				<div
					ref="bottomPlaceholder"
					className={ spacerClassName }
					style={ { height: this.state.bottomPlaceholderHeight } }
				/>
			</div>
		);
	}

	_setContainerY( position ) {
		if ( this.props.context && this.props.context !== window ) {
			this.props.context.scrollTop = position;
			return;
		}
		window.scrollTo( 0, position );
	}

	/**
	 * We are manually setting the scroll position to the last remembered one, so we
	 * want to override the scroll position that would otherwise get applied from
	 * HTML5 history.
	 */
	_overrideHistoryScroll() {
		if ( ! this._contextLoaded() ) {
			return;
		}
		this._scrollContainer.addEventListener( 'scroll', this._resetScroll );
	}

	_resetScroll = event => {
		const position = this.state.scrollTop;
		if ( ! this._contextLoaded() ) {
			return;
		}
		debug( 'history setting scroll position:', event );
		this._setContainerY( position );
		this._scrollContainer.removeEventListener( 'scroll', this._resetScroll );
		debug( 'override scroll position from HTML5 history popstate:', position );
	};

	/**
	 * Determine whether context is available or still being rendered.
	 * @return {bool} whether context is available
	 */
	_contextLoaded() {
		return this.props.context || this.props.context === false || ! ( 'context' in this.props );
	}

	/* SCROLL HELPER */

	initScrolling() {
		this.itemHeights = {};

		// Hide levels and context height
		this.contextHeight = null;
		this.topHideLevelHard = null;
		this.topHideLevelSoft = null;
		this.bottomHideLevelHard = null;
		this.bottomHideLevelSoft = null;
		this.bottomHideLevelUltraSoft = null;

		// set by component
		this.scrollPosition = null;

		// queried directly from placeholder rects
		this.containerTop = null;
		this.topPlaceholderHeight = null;
		this.bottomPlaceholderHeight = null;
		this.containerBottom = null;

		this.stateUpdated = null;
		this.firstRenderedIndex = null;
		this.lastRenderedIndex = null;
	}

	storedItemHeight( itemKey ) {
		let height = this.props.guessedItemHeight;

		if ( itemKey in this.itemHeights ) {
			height = this.itemHeights[ itemKey ];
		}

		return height;
	}

	forEachInRow( index, callback, context ) {
		if ( typeof callback !== 'function' ) {
			return;
		}

		if ( context ) {
			callback = callback.bind( context );
		}

		const firstIndexInRow = index - ( index % this.props.itemsPerRow ),
			lastIndexInRow =
				Math.min( firstIndexInRow + this.props.itemsPerRow, this.props.items.length ) - 1;
		for ( let i = firstIndexInRow; i <= lastIndexInRow; i++ ) {
			callback( this.props.items[ i ], i );
		}
	}

	storeRowItemHeights( fromDirection, index ) {
		this.forEachInRow(
			index,
			function( item ) {
				const itemKey = this.props.getItemRef( item ),
					itemBounds = this.boundsForRef( itemKey );
				let height;

				if ( itemBounds ) {
					if ( 'bottom' === fromDirection ) {
						height = this.containerBottom - this.bottomPlaceholderHeight - itemBounds.top;
					} else {
						height = itemBounds.bottom - ( this.containerTop + this.topPlaceholderHeight );
					}
				} else {
					height = this.props.guessedItemHeight;
				}

				this.itemHeights[ itemKey ] = height;
			},
			this
		);
	}

	deleteRowItemHeights( index ) {
		this.forEachInRow(
			index,
			item => {
				const itemKey = this.props.getItemRef( item );
				delete this.itemHeights[ itemKey ];
			},
			this
		);
	}

	getRowHeight( index ) {
		let maxHeight = 0;

		this.forEachInRow(
			index,
			item => {
				const itemKey = this.props.getItemRef( item ),
					height = this.storedItemHeight( itemKey );

				maxHeight = Math.max( maxHeight, height );
			},
			this
		);

		return maxHeight;
	}

	updateContextHeight( contextHeight ) {
		if ( this.contextHeight === contextHeight ) {
			return;
		}

		this.contextHeight = contextHeight;

		this.topHideLevelHard = Math.min( -1 * contextHeight, -5 * this.props.guessedItemHeight );

		this.topHideLevelSoft = Math.min( -2 * contextHeight, -10 * this.props.guessedItemHeight );

		this.bottomHideLevelHard =
			contextHeight + Math.max( contextHeight, 5 * this.props.guessedItemHeight );

		this.bottomHideLevelSoft =
			contextHeight + Math.max( 2 * contextHeight, 10 * this.props.guessedItemHeight );

		this.bottomHideLevelUltraSoft =
			contextHeight + Math.max( 3 * contextHeight, 15 * this.props.guessedItemHeight );
	}

	initialLastRenderedIndex() {
		return Math.min(
			this.props.items.length - 1,
			Math.floor( this.bottomHideLevelSoft / this.props.guessedItemHeight ) - 1
		);
	}

	updatePlaceholderDimensions() {
		const topPlaceholderRect = this.boundsForRef( 'topPlaceholder' ),
			bottomPlaceholderRect = this.boundsForRef( 'bottomPlaceholder' );

		this.topPlaceholderHeight = topPlaceholderRect.height;
		this.containerTop = topPlaceholderRect.top;

		this.bottomPlaceholderHeight = bottomPlaceholderRect.height;
		// It is important to use placeholder to get container bottom.
		// Container node is reported longer than it should be in mobile Safari 7.0
		this.containerBottom = bottomPlaceholderRect.bottom;
	}

	triggerScrollChanges( state ) {
		this.reset( state );

		this.adjustLastRenderedIndex();

		if ( this.shouldHideItemsAbove() ) {
			this.hideItemsAbove();
		} else if ( this.shouldShowItemsAbove() ) {
			this.showItemsAbove();
		}

		if ( this.shouldHideItemsBelow() ) {
			this.hideItemsBelow();
		} else if ( this.shouldShowItemsBelow() ) {
			this.showItemsBelow();
		}

		if ( this.shouldLoadNextPage() ) {
			this.loadNextPage();
		}
	}

	reset( state ) {
		this.stateUpdated = false;
		this.firstRenderedIndex = state.firstRenderedIndex;
		this.lastRenderedIndex = state.lastRenderedIndex;
	}

	adjustLastRenderedIndex() {
		// last index -1 means everything is rendered - it can happen when
		// item count is not known when component is mounted
		const offset = this.initialLastRenderedIndex(),
			lastIndex = this.lastRenderedIndex || 0, // fixes NaN
			firstIndex = this.firstRenderedIndex || 0, // fixes NaN
			itemCount = this.props.items.length;
		let newIndex = lastIndex;

		if ( itemCount === 0 ) {
			newIndex = -1;
		}

		if ( lastIndex >= itemCount ) {
			newIndex = Math.min( firstIndex + offset, itemCount - 1 );
		}

		if ( newIndex === -1 && itemCount > 0 && firstIndex === 0 ) {
			newIndex = offset;
		}

		if ( newIndex !== this.lastRenderedIndex ) {
			this.stateUpdated = true;
			this.lastRenderedIndex = newIndex;
		}
	}

	shouldHideItemsAbove() {
		//
		// Hiding Item Above Chart
		//
		//       +---- container top relative to context - value below zero
		//       |
		//       |  placeholder
		//       |
		//       +---- placeholder bottom edge (before) = container top + placeholder height
		//       |
		//       | item to be hidden
		//       |
		//       +----
		//       |
		//  -----|- soft hide limit = - 2 * context height
		//       |
		//       | item to be hidden
		//       |
		//       +----
		//       |
		//       | last item to be hidden
		//       |
		//       +---- new placeholder bottom edge
		//       |
		//  -----|- hard hide limit = -1 * context height
		//       |
		//       | this item will stay
		//       |
		//       +----
		//       |
		//       |
		//       |
		//       |
		//  -----|- context top = 0
		//       |
		//
		return this.containerTop + this.topPlaceholderHeight < this.topHideLevelSoft;
	}

	hideItemsAbove() {
		let rowHeight, rowBottom;

		while ( this.firstRenderedIndex < this.props.items.length ) {
			this.storeRowItemHeights( 'top', this.firstRenderedIndex );
			rowHeight = this.getRowHeight( this.firstRenderedIndex );
			rowBottom = this.containerTop + this.topPlaceholderHeight + rowHeight;

			if ( rowBottom > this.topHideLevelHard ) {
				this.deleteRowItemHeights( this.firstRenderedIndex );
				break;
			}

			this.topPlaceholderHeight += rowHeight;
			this.firstRenderedIndex += this.props.itemsPerRow;
			this.stateUpdated = true;
			debug( 'hiding top item', rowHeight, this.topPlaceholderHeight );
		}
	}

	shouldShowItemsAbove() {
		//
		// Showing Item Above Chart
		//
		//       +---- container top relative to context - value below zero
		//       |
		//       |
		//       |
		//       |
		//  -----|- soft hide limit = - 2 * context height
		//       |
		//       +---- new placeholder bottom
		//       |
		//       | Last item to be shown
		//       |
		//       +----
		//       |
		//  -----|- hard hide limit = -1 * context height
		//       |
		//       +----
		//       |
		//       | Item to be shown
		//       |
		//       +---- placeholder bottom when check started
		//       |
		//  -----|- context top = 0
		//       |
		//
		return this.containerTop + this.topPlaceholderHeight > this.topHideLevelHard;
	}

	showItemsAbove() {
		let rowHeight, newPlaceholderBottom;

		while ( this.firstRenderedIndex > 0 ) {
			rowHeight = this.getRowHeight( this.firstRenderedIndex - this.props.itemsPerRow );
			newPlaceholderBottom = this.containerTop + this.topPlaceholderHeight - rowHeight;

			if ( newPlaceholderBottom < this.topHideLevelSoft ) {
				break;
			}

			this.deleteRowItemHeights( this.firstRenderedIndex - this.props.itemsPerRow );
			this.firstRenderedIndex -= this.props.itemsPerRow;
			this.firstRenderedIndex = Math.max( 0, this.firstRenderedIndex );
			if ( this.firstRenderedIndex <= 0 ) {
				// never allow top placeholder when everything is shown
				this.topPlaceholderHeight = 0;
			} else {
				this.topPlaceholderHeight = Math.max( 0, this.topPlaceholderHeight - rowHeight );
			}

			this.stateUpdated = true;
			debug( 'showing top item', rowHeight, this.topPlaceholderHeight );
		}
	}

	shouldHideItemsBelow() {
		//
		// Hiding Items Below Chart
		//
		//       |
		//  -----|- context bottom = 1 * context height, e.g. 1000
		//       |
		//       +----
		//       |
		//       | Item
		//       |
		//       +----
		//       |
		//  -----|- hard hide limit, e.g. 2000
		//       |
		//       +---- new placeholder top
		//       |
		//       | Last item to be hidden
		//       |
		//       +----
		//       |
		//  -----|- soft hide limit, e.g. 3000
		//       |
		//       +----
		//       |
		//       | Item to be hidden
		//       |
		//       +----
		//       |
		//  -----|- 3rd hide limit, e.g. 4000
		//       |
		//       | Item to be hidden
		//       |
		//       +---- placeholder top when check started
		//       |
		//       |
		//       | Bottom placeholder
		//       |
		//       +---- container bottom relative to context, e.g. 5000
		//
		const placeholderTop = this.containerBottom - this.bottomPlaceholderHeight;
		return placeholderTop > this.bottomHideLevelUltraSoft;
	}

	hideItemsBelow() {
		let rowTop, rowHeight;

		while ( this.lastRenderedIndex >= 0 ) {
			this.storeRowItemHeights( 'bottom', this.lastRenderedIndex );
			rowHeight = this.getRowHeight( this.lastRenderedIndex );
			rowTop = this.containerBottom - this.bottomPlaceholderHeight - rowHeight;

			if ( rowTop < this.bottomHideLevelHard ) {
				this.deleteRowItemHeights( this.lastRenderedIndex );
				break;
			}

			this.bottomPlaceholderHeight += rowHeight;
			this.lastRenderedIndex -= this.props.itemsPerRow;
			this.stateUpdated = true;
			debug( 'hiding bottom item', rowHeight, this.bottomPlaceholderHeight );
		}
	}

	shouldShowItemsBelow() {
		const placeholderTop = this.containerBottom - this.bottomPlaceholderHeight;
		return placeholderTop < this.bottomHideLevelHard;
	}

	showItemsBelow() {
		let rowHeight, itemTop, placeholderTop;

		while ( this.lastRenderedIndex < this.props.items.length - 1 ) {
			rowHeight = this.getRowHeight( this.lastRenderedIndex + this.props.itemsPerRow );
			placeholderTop = this.containerBottom - this.bottomPlaceholderHeight;
			itemTop = placeholderTop + rowHeight;

			if (
				itemTop > this.bottomHideLevelSoft &&
				// always show at least one item when placholder top is above hard limit
				placeholderTop > this.bottomHideLevelHard
			) {
				break;
			}

			this.deleteRowItemHeights( this.lastRenderedIndex + this.props.itemsPerRow );
			if ( this.bottomPlaceholderHeight - rowHeight < 0 ) {
				this.containerBottom += rowHeight - this.bottomPlaceholderHeight;
				this.bottomPlaceholderHeight = 0;
			} else {
				this.bottomPlaceholderHeight -= rowHeight;
			}
			this.lastRenderedIndex += this.props.itemsPerRow;
			this.lastRenderedIndex = Math.min( this.lastRenderedIndex, this.props.items.length - 1 );

			// if everything is shown, then there should be no placeholder
			if ( this.lastRenderedIndex >= this.props.items.length - 1 ) {
				this.bottomPlaceholderHeight = 0;
			}

			this.stateUpdated = true;
			debug( 'showing bottom item', rowHeight, this.bottomPlaceholderHeight );
		}
	}

	shouldLoadNextPage() {
		if ( this.props.fetchingNextPage || this.props.lastPage ) {
			return false;
		}

		return this.bottomPlaceholderHeight === 0 && this.containerBottom < this.bottomHideLevelHard;
	}

	loadNextPage() {
		if ( this.queuedFetchNextPage ) {
			return;
		}
		let triggeredByScroll = this.triggeredByScroll;

		debug( 'fetching next page', this.containerBottom, this.bottomPlaceholderHeight );

		// Consider all page fetches once user starts scrolling as triggered by scroll
		// Same condition check is in components/infinite-scroll checkScrollPosition
		if ( this.scrollPosition > this.contextHeight ) {
			triggeredByScroll = true;
		}

		// scroll check may be triggered while dispatching an action,
		// we cannot create new action while dispatching old one
		this.queuedFetchNextPage = Promise.resolve().then( () => {
			this.queuedFetchNextPage = null;
			// checking these values again because we shifted the fetch to the next stack
			if ( this.props.fetchingNextPage || this.props.lastPage ) {
				return false;
			}
			this.props.fetchNextPage( {
				triggeredByScroll: triggeredByScroll,
			} );
		} );
	}
}
