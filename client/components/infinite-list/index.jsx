/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:infinite-list' ),
	omit = require( 'lodash/omit' ),
	ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	page = require( 'page' );

/**
 * Internal dependencies
 */
var ScrollHelper = require( './scroll-helper' ),
	InfiniteListPositionsStore = require( 'lib/infinite-list/positions-store' ),
	InfiniteListScrollStore = require( 'lib/infinite-list/scroll-store' ),
	InfiniteListActions = require( 'lib/infinite-list/actions' ),
	detectHistoryNavigation = require( 'lib/detect-history-navigation' ),
	scrollTo = require( 'lib/scroll-to' ),
	smartSetState = require( 'lib/react-smart-set-state' );

module.exports = React.createClass( {
	displayName: 'InfiniteList',

	lastScrollTop: -1,
	scrollRAFHandle: false,
	scrollHelper: null,
	isScrolling: false,

	propTypes: {
		items: React.PropTypes.array.isRequired,
		fetchingNextPage: React.PropTypes.bool.isRequired,
		lastPage: React.PropTypes.bool.isRequired,
		guessedItemHeight: React.PropTypes.number.isRequired,
		itemsPerRow: React.PropTypes.number,

		fetchNextPage: React.PropTypes.func.isRequired,
		getItemRef: React.PropTypes.func.isRequired,
		renderItem: React.PropTypes.func.isRequired,
		renderLoadingPlaceholders: React.PropTypes.func.isRequired,
		renderTrailingItems: React.PropTypes.func,
		context: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool,
		] ),
	},

	getDefaultProps: function() {
		return {
			itemsPerRow: 1,
			renderTrailingItems: () => {}
		};
	},

	smartSetState: smartSetState,

	componentWillMount: function() {
		var url = page.current,
			newState, scrollPosition;

		if ( detectHistoryNavigation.loadedViaHistory() ) {
			newState = InfiniteListPositionsStore.get( url );
			scrollPosition = InfiniteListScrollStore.get( url );
		}

		if ( newState && scrollPosition ) {
			debug( 'overriding scrollTop:', scrollPosition );
			newState.scrollTop = scrollPosition;
		}

		this.scrollHelper = new ScrollHelper( this.boundsForRef );
		this.scrollHelper.props = this.props;
		if ( this._contextLoaded() ) {
			this._scrollContainer = this.props.context || window;
			this.scrollHelper.updateContextHeight( this.getCurrentContextHeight() );
		}

		this.isScrolling = false;

		if ( newState ) {
			debug( 'infinite-list positions loaded from store' );
		} else {
			debug( 'infinite-list positions reset for new list' );
			newState = {
				firstRenderedIndex: 0,
				topPlaceholderHeight: 0,
				lastRenderedIndex: this.scrollHelper.initialLastRenderedIndex(),
				bottomPlaceholderHeight: 0,
				scrollTop: 0
			};
		}
		debug( 'infinite list mounting', newState );
		this.setState( newState );
	},

	componentDidMount: function() {
		if ( this._contextLoaded() ) {
			this._setContainerY( this.state.scrollTop );
		}

		// only override browser history scroll if navigated via history
		if ( detectHistoryNavigation.loadedViaHistory() ) {
			this._overrideHistoryScroll();
		}
		debug( 'setting scrollTop:', this.state.scrollTop );
		this.updateScroll( {
			triggeredByScroll: false
		} );
		if ( this._contextLoaded() ) {
			this._scrollContainer.addEventListener( 'scroll', this.onScroll );
		}
	},

	componentWillReceiveProps: function( newProps ) {
		this.scrollHelper.props = newProps;

		// New item may have arrived, should we change the rendered range?
		if ( ! this.isScrolling ) {
			this.cancelAnimationFrame();
			this.updateScroll( {
				triggeredByScroll: false
			} );
		}

		// if the context changes, remove our scroll listener
		if ( newProps.context === this.props.context ) {
			return;
		}
		if ( this._contextLoaded() ) {
			this._scrollContainer.removeEventListener( 'scroll', this._resetScroll );
		}
	},

	componentDidUpdate: function( prevProps ) {
		if ( ! this._contextLoaded() ) {
			return;
		}

		if ( this.props.context !== prevProps.context ) {
			// remove old listener
			if ( this._scrollContainer ) {
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
			this.updateScroll( {
				triggeredByScroll: false
			} );
		}
	},

	reset: function() {
		this.cancelAnimationFrame();

		this.scrollHelper = new ScrollHelper( this.boundsForRef );
		this.scrollHelper.props = this.props;
		if ( this._contextLoaded() ) {
			this._scrollContainer = this.props.context || window;
			this.scrollHelper.updateContextHeight( this.getCurrentContextHeight() );
		}

		this.isScrolling = false;

		this.setState( {
			firstRenderedIndex: 0,
			topPlaceholderHeight: 0,
			lastRenderedIndex: this.scrollHelper.initialLastRenderedIndex(),
			bottomPlaceholderHeight: 0,
			scrollTop: 0
		} );
	},

	componentWillUnmount: function() {
		this._scrollContainer.removeEventListener( 'scroll', this.onScroll );
		this._scrollContainer.removeEventListener( 'scroll', this._resetScroll );
		this.cancelAnimationFrame();
	},

	cancelAnimationFrame: function() {
		if ( this.scrollRAFHandle ) {
			window.cancelAnimationFrame( this.scrollRAFHandle );
			this.scrollRAFHandle = null;
		}
		this.lastScrollTop = -1;
	},

	onScroll: function() {
		if ( this.isScrolling ) {
			return;
		}
		if ( ! this.scrollRAFHandle && this.getCurrentScrollTop() !== this.lastScrollTop ) {
			this.scrollRAFHandle = window.requestAnimationFrame( this.scrollChecks );
		}
	},

	getCurrentContextHeight: function() {
		var context = this.props.context || window.document.documentElement;
		return context.clientHeight;
	},

	getCurrentScrollTop: function() {
		if ( this.props.context ) {
			debug( 'getting scrollTop from context' );
			return this.props.context.scrollTop;
		}
		return window.pageYOffset;
	},

	scrollChecks: function() {
		// isMounted is necessary to prevent running this before it is mounted,
		// which could be triggered by data-observe mixin.
		if ( ! this.isMounted() || this.getCurrentScrollTop() === this.lastScrollTop ) {
			this.scrollRAFHandle = null;
			return;
		}
		this.updateScroll( {
			triggeredByScroll: true
		} );
	},

	scrollToTop: function() {
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
					if ( this.isMounted() ) {
						this.updateScroll( { triggeredByScroll: false } );
					}
					this.isScrolling = false;
				}
			} );
		}
	},

	updateScroll: function( options ) {
		var url = page.current,
			newState;

		if ( ! this._contextLoaded() ) {
			return;
		}

		this.lastScrollTop = this.getCurrentScrollTop();
		InfiniteListActions.storeScroll( url, this.lastScrollTop );
		this.scrollHelper.updateContextHeight( this.getCurrentContextHeight() );
		this.scrollHelper.scrollPosition = this.lastScrollTop;
		this.scrollHelper.triggeredByScroll = options.triggeredByScroll;
		this.scrollHelper.updatePlaceholderDimensions();

		this.scrollHelper.scrollChecks( this.state );

		if ( this.scrollHelper.stateUpdated ) {
			newState = {
				firstRenderedIndex: this.scrollHelper.firstRenderedIndex,
				topPlaceholderHeight: this.scrollHelper.topPlaceholderHeight,
				lastRenderedIndex: this.scrollHelper.lastRenderedIndex,
				bottomPlaceholderHeight: this.scrollHelper.bottomPlaceholderHeight,
				scrollTop: this.lastScrollTop
			};

			// Force one more check on next animation frame,
			// item heights may have been guessed wrong.
			this.lastScrollTop = -1;

			debug( 'new scroll positions', newState, this.state );
			this.smartSetState( newState );
			InfiniteListActions.storePositions( url, newState );
		}

		this.scrollRAFHandle = window.requestAnimationFrame( this.scrollChecks );
	},

	boundsForRef: function( ref ) {
		if ( ref in this.refs ) {
			return ReactDom.findDOMNode( this.refs[ ref ] ).getBoundingClientRect();
		}
		return null;
	},

	/**
	 * Returns a list of visible item indexes. This includes any items that are
	 * partially visible in the viewport.
	 * @param options.offsetTop - in pixels, 0 if unspecified
	 * @param options.offsetBottom - in pixels, 0 if unspecified
	 * @returns {Array}
	 */
	getVisibleItemIndexes: function( options ) {
		var container = ReactDom.findDOMNode( this ),
			visibleItemIndexes = [],
			firstIndex = this.state.firstRenderedIndex,
			lastIndex = this.state.lastRenderedIndex,
			offsetTop = options && options.offsetTop ? options.offsetTop : 0,
			offsetBottom = options && options.offsetBottom ? options.offsetBottom : 0,
			windowHeight,
			rect,
			children,
			i;
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
					( rect.top > 0 && rect.top < windowHeight - offsetBottom ) ) {
					visibleItemIndexes.push( {
						index: firstIndex + i - 1,
						bounds: rect
					} );
				}
			}
		}
		return visibleItemIndexes;
	},

	render: function() {
		var lastRenderedIndex = this.state.lastRenderedIndex,
			itemsToRender = [],
			propsToTransfer = omit( this.props, Object.keys( this.constructor.propTypes ) ),
			spacerClassName = 'infinite-list__spacer',
			i;

		if ( lastRenderedIndex === -1 || lastRenderedIndex > this.props.items.length - 1 ) {
			debug( 'resetting lastRenderedIndex, currently at %s, %d items', lastRenderedIndex, this.props.items.length );
			lastRenderedIndex = Math.min( this.state.firstRenderedIndex + this.scrollHelper.initialLastRenderedIndex(), this.props.items.length - 1 );
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
			<div {...propsToTransfer}>
				<div ref="topPlaceholder"
					className={ spacerClassName }
					style={ { height: this.state.topPlaceholderHeight } } />
				{ itemsToRender }
				{ this.props.renderTrailingItems() }
				<div ref="bottomPlaceholder"
					className={ spacerClassName }
					style={ { height: this.state.bottomPlaceholderHeight } } />
			</div>
		);
	},

	_setContainerY: function( position ) {
		if ( this.props.context && this.props.context !== window ) {
			this.props.context.scrollTop = position;
			return;
		}
		window.scrollTo( 0, position );
	},

	/**
	 * We are manually setting the scroll position to the last remembered one, so we
	 * want to override the scroll position that would otherwise get applied from
	 * HTML5 history.
	 */
	_overrideHistoryScroll: function() {
		if ( ! this._contextLoaded() ) {
			return;
		}
		this._scrollContainer.addEventListener( 'scroll', this._resetScroll );
	},

	_resetScroll: function( event ) {
		var position = this.state.scrollTop;
		if ( ! this._contextLoaded() ) {
			return;
		}
		debug( 'history setting scroll position:', event );
		this._setContainerY( position );
		this._scrollContainer.removeEventListener( 'scroll', this._resetScroll );
		debug( 'override scroll position from HTML5 history popstate:', position );
	},

	/**
	 * Determine whether context is available or still being rendered.
	 * @return {bool} whether context is available
	 */
	_contextLoaded: function() {
		return this.props.context || this.props.context === false || ! ( 'context' in this.props );
	}

} );
