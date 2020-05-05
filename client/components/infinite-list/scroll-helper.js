/**
 * External dependencies
 */
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:infinite-list:helper' );

// Scrolling algorithm extracted as separate object
// The purpose of extracting it is to make it testable and help the methods
// to be shorter and readable.
class ScrollHelper {
	constructor( boundsForRef, getTopPlaceholderBounds, getBottomPlaceholderBounds ) {
		this.boundsForRef = boundsForRef;
		this.getTopPlaceholderBounds = getTopPlaceholderBounds;
		this.getBottomPlaceholderBounds = getBottomPlaceholderBounds;
		this.itemHeights = {};

		// Hide levels and context height
		this.contextHeight = null;
		this.topHideLevelHard = null;
		this.topHideLevelSoft = null;
		this.bottomHideLevelHard = null;
		this.bottomHideLevelSoft = null;
		this.bottomHideLevelUltraSoft = null;

		// set by component
		this.props = null;
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

	forEachInRow( index, callback ) {
		const { itemsPerRow } = this.props;

		const firstIndexInRow = index - ( index % itemsPerRow );
		const lastIndexInRow = Math.min( firstIndexInRow + itemsPerRow, this.props.items.length ) - 1;

		for ( let i = firstIndexInRow; i <= lastIndexInRow; i++ ) {
			callback( this.props.items[ i ], i );
		}
	}

	storeRowItemHeights( fromDirection, index ) {
		this.forEachInRow( index, ( item ) => {
			const itemKey = this.props.getItemRef( item );
			const itemBounds = this.boundsForRef( itemKey );
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
		} );
	}

	deleteRowItemHeights( index ) {
		this.forEachInRow( index, ( item ) => {
			const itemKey = this.props.getItemRef( item );
			delete this.itemHeights[ itemKey ];
		} );
	}

	getRowHeight( index ) {
		let maxHeight = 0;

		this.forEachInRow( index, ( item ) => {
			const itemKey = this.props.getItemRef( item );
			const height = this.storedItemHeight( itemKey );

			maxHeight = Math.max( maxHeight, height );
		} );

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
		const topPlaceholderRect = this.getTopPlaceholderBounds();
		const bottomPlaceholderRect = this.getBottomPlaceholderBounds();

		if ( ! topPlaceholderRect || ! bottomPlaceholderRect ) {
			return;
		}

		this.topPlaceholderHeight = topPlaceholderRect.height;
		this.containerTop = topPlaceholderRect.top;

		this.bottomPlaceholderHeight = bottomPlaceholderRect.height;
		// It is important to use placeholder to get container bottom.
		// Container node is reported longer than it should be in mobile Safari 7.0
		this.containerBottom = bottomPlaceholderRect.bottom;
	}

	scrollChecks( state ) {
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

export default ScrollHelper;
