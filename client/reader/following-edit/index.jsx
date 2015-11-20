// External dependencies
const React = require( 'react' ),
	times = require( 'lodash/utility/times' ),
	trimLeft = require( 'lodash/string/trimLeft' ),
	Immutable = require( 'immutable' ),
	debounce = require( 'lodash/function/debounce' );

// Internal dependencies
const Main = require( 'components/main' ),
	FeedSubscriptionStore = require( 'lib/reader-feed-subscriptions' ),
	SiteStore = require( 'lib/reader-site-store' ),
	FeedStore = require( 'lib/feed-store' ),
	FeedSubscriptionActions = require( 'lib/reader-feed-subscriptions/actions' ),
	EmptyContent = require( 'components/empty-content' ),
	NoResults = require( 'my-sites/no-results' ),
	InfiniteList = require( 'components/infinite-list' ),
	SubscriptionPlaceholder = require( './placeholder' ),
	SubscriptionListItem = require( './list-item' ),
	SimpleNotice = require( 'notices/simple-notice' ),
	stats = require( 'reader/stats' ),
	Search = require( 'components/search' ),
	URLSearch = require( 'lib/mixins/url-search' ),
	FollowingEditSubscribeForm = require( './subscribe-form' ),
	FeedSubscriptionErrorTypes = require( 'lib/reader-feed-subscriptions/constants' ).error,
	MobileBackToSidebar = require( 'components/mobile-back-to-sidebar' ),
	smartSetState = require( 'lib/react-smart-set-state' ),
	escapeRegexp = require( 'escape-string-regexp' ),
	FollowingEditSortControls = require( './sort-controls' ),
	FollowingEditHelper = require( 'reader/following-edit/helper' );

const initialLoadFeedCount = 20;

var FollowingEdit = React.createClass( {

	mixins: [ URLSearch ],

	propTypes: {
		initialFollowUrl: React.PropTypes.string,
		search: React.PropTypes.string
	},

	getInitialState: function() {
		return this.getStateFromStores();
	},

	getDefaultProps: function() {
		return {
			initialFollowUrl: ''
		}
	},

	smartSetState: smartSetState,

	getStateFromStores: function( props = this.props ) {
		const newState = {
			subscriptions: FeedSubscriptionStore.getSubscriptions().list,
			currentPage: FeedSubscriptionStore.getCurrentPage(),
			isLastPage: FeedSubscriptionStore.isLastPage(),
			isLoading: FeedSubscriptionStore.isFetching(),
			lastError: FeedSubscriptionStore.getLastError(),
			totalSubscriptions: FeedSubscriptionStore.getTotalSubscriptions(),
			windowWidth: this.getWindowWidth()
		};

		if ( props.search ) {
			newState.subscriptions = this.searchSubscriptions( newState.subscriptions, props.search );
		}

		if ( this.state && this.state.sortOrder ) {
			newState.subscriptions = this.sortSubscriptions( newState.subscriptions, this.state.sortOrder );
		}

		return newState;
	},

	// Add change listeners to stores
	componentDidMount: function() {
		FeedSubscriptionStore.on( 'add', this.handleAdd );
		FeedSubscriptionStore.on( 'change', this.handleChange );
		FeedSubscriptionStore.on( 'remove', this.handleRemove );
		window.addEventListener( 'resize', this.handleResize );
	},

	// Remove change listers from stores
	componentWillUnmount: function() {
		FeedSubscriptionStore.clearErrors();
		FeedSubscriptionStore.off( 'add', this.handleAdd );
		FeedSubscriptionStore.off( 'change', this.handleChange );
		FeedSubscriptionStore.off( 'remove', this.handleRemove );
		window.removeEventListener( 'resize', this.handleResize );
	},

	componentWillReceiveProps: function( nextProps ) {
		this.smartSetState( this.getStateFromStores( nextProps ) );
	},

	searchSubscriptions: function( subscriptions, phrase ) {
		return subscriptions.filter( function( item ) {
			const feed = FeedStore.get( item.get( 'feed_ID' ) ),
				site = SiteStore.get( item.get( 'blog_ID' ) ),
				phraseRe = new RegExp( escapeRegexp( phrase ), 'i' );
			return item.get( 'URL' ).indexOf( phraseRe ) !== -1 ||
				( site && ( site.get( 'name' ) || '' ).search( phraseRe ) !== -1 ) ||
				( site && ( site.get( 'URL' ) || '' ).search( phraseRe ) !== -1 ) ||
				( feed && ( feed.name || '' ).search( phraseRe ) !== -1 ) ||
				( feed && ( feed.URL || '' ).search( phraseRe ) !== -1 ) ||
				( feed && ( feed.feed_URL || '' ).search( phraseRe ) !== -1 );
		}, this );
	},

	sortSubscriptions: function( subscriptions, sortOrder ) {
		if ( ! subscriptions ) {
			return;
		}

		if ( sortOrder === 'alpha' ) {
			return subscriptions.sortBy( function( subscription ) {
				const feed = FeedStore.get( subscription.get( 'feed_ID' ) ),
					site = SiteStore.get( subscription.get( 'blog_ID' ) ),
					displayUrl = FollowingEditHelper.formatUrlForDisplay( subscription.get( 'URL' ) );
				return trimLeft( FollowingEditHelper.getFeedTitle( site, feed, displayUrl ).toLowerCase() );
			} );
		}

		return subscriptions.sortBy( function( subscription ) {
			return subscription.get( 'date_subscribed' )
		} ).reverse();
	},

	handleAdd: function( newSubscription ) {
		let newState = {
			isAttemptingFollow: false
		};

		// If it's a brand new subscription, re-sort by date followed so
		// that the new sub appears at the top
		if ( newSubscription && ! newSubscription.get( 'is_refollow' ) ) {
			newState.sortOrder = 'date-followed';
		}

		this.setState( newState );
	},

	handleChange: function() {
		this.smartSetState( this.getStateFromStores() );
	},

	handleRemove: function( url ) {
		this.setState( { lastUnfollow: url } );
	},

	handleResize: debounce( function() {
		this.setState( { windowWidth: this.getWindowWidth() } );
	}, 500 ),

	handleSortOrderChange: function( newSortOrder ) {
		this.setState( {
			sortOrder: newSortOrder,
			subscriptions: this.sortSubscriptions( this.state.subscriptions, newSortOrder )
		} );
	},

	handleNotificationSettingsOpen: function( cardKey ) {
		let openCards = this.state.openCards;
		if ( ! openCards ) {
			openCards = Immutable.List(); // eslint-disable-line new-cap
		}

		const newOpenCards = openCards.push( cardKey );
		this.setState( { openCards: newOpenCards } );
	},

	handleNotificationSettingsClose: function( cardKey ) {
		const openCards = this.state.openCards;
		if ( ! openCards ) {
			return;
		}

		const newOpenCards = openCards.filterNot( function( key ) {
			return key === cardKey;
		} );
		this.setState( { openCards: newOpenCards } );
	},

	fetchNextPage: function() {
		if ( this.state.isLastPage ) {
			return;
		}

		FeedSubscriptionActions.fetchNextPage();
	},

	getSubscriptionRef: function( subscription ) {
		return 'subscription-' + subscription.get( 'ID' );
	},

	getWindowWidth: function() {
		return typeof window !== 'undefined' && window.innerWidth;
	},

	renderSubscription: function( subscription ) {
		const subscriptionKey = this.getSubscriptionRef( subscription );

		return (
			<SubscriptionListItem
				ref={ subscriptionKey }
				key={ subscriptionKey }
				subscription={ subscription }
				onNotificationSettingsOpen={ this.handleNotificationSettingsOpen }
				onNotificationSettingsClose={ this.handleNotificationSettingsClose }
				openCards={ this.state.openCards } />
		);
	},

	renderLoadingPlaceholders: function() {
		var count = this.state.subscriptions.size ? 10 : initialLoadFeedCount;
		return times( count, function( i ) {
			return( <SubscriptionPlaceholder key={ 'placeholder-' + i } /> );
		} );
	},

	dismissError: function( event ) {
		event.preventDefault();

		// Call originating store and mark error as dismissed
		FeedSubscriptionActions.dismissError( this.state.lastError );
		this.setState( { isAttemptingFollow: false } );
		stats.recordAction( 'dismiss_follow_error' );
		stats.recordGaEvent( 'Clicked Dismiss Follow Error' );
	},

	handleNewSubscriptionSearch: function( searchString ) {
		// Clear the last follow error if the search box is empty
		if ( this.state.lastError ) {
			this.setState( { isAttemptingFollow: false } );
			FeedSubscriptionActions.dismissError( this.state.lastError );
		}

		// We only retain the search string for error messages in this component,
		// so ignore empty ones
		if ( searchString !== 'http://' && searchString !== '' ) {
			this.setState( { searchString: searchString } );
		}
	},

	handleNewSubscriptionSearchClose: function() {
		if ( this.state.lastError && this.state.lastError.errorType === FeedSubscriptionErrorTypes.UNABLE_TO_FOLLOW ) {
			this.setState( { isAttemptingFollow: false } );
			FeedSubscriptionActions.dismissError( this.state.lastError );
		}
	},

	handleFollow: function() {
		this.setState( { isAttemptingFollow: true } );
	},

	renderUnfollowError: function() {
		if ( ! this.state.lastError || this.state.lastError.errorType !== FeedSubscriptionErrorTypes.UNABLE_TO_UNFOLLOW ) {
			return null;
		}

		const url = this.state.lastError.URL;

		return ( <SimpleNotice
					status="is-error"
					isCompact={ true }
					showDismiss={ true }
					onClick={ this.dismissError }>
					{ this.translate( 'Sorry - there was a problem unfollowing {{strong}}%(url)s{{/strong}}.', {
						components: { strong: <strong /> },
						args: { url: url } } )
					}
					</SimpleNotice>
		);
	},

	renderFollowError: function() {
		if ( ! this.state.lastError || this.state.lastError.errorType !== FeedSubscriptionErrorTypes.UNABLE_TO_FOLLOW ) {
			return null;
		}

		const lastError = this.state.lastError;
		let errorMessage = this.translate( 'Sorry, we couldn\'t find a feed for {{em}}%(url)s{{/em}}.', {
			args: { url: this.state.searchString },
			components: { em: <em/> }
		} );

		if ( lastError.info && lastError.info === 'already_subscribed' ) {
			errorMessage = this.translate( "You're already subscribed to that site." );
		}

		return ( <SimpleNotice
					status="is-error"
					isCompact={ true }
					showDismiss={ true }
					onClick={ this.dismissError }>
					{ errorMessage }
				</SimpleNotice>
		);
	},

	render: function() {
		let subscriptions = this.state.subscriptions,
			subscriptionsToDisplay = [],
			searchPlaceholder = '';

		// We're only interested in showing subscriptions with an ID (i.e. those that came from the API)
		// At this point we may have some kicking around that just have a URL, such as those added when
		// the following stream was processed
		if ( subscriptions ) {
			subscriptionsToDisplay = subscriptions.filter( function( subscription ) {
				return subscription.has( 'ID' )
			} ).toArray();
		}

		if ( ! subscriptionsToDisplay || subscriptionsToDisplay.length < initialLoadFeedCount ) {
			// If we don't have any data after a fetch has happened, show EmptyContent
			if ( this.props.isLastPage ) {
				return ( <EmptyContent title={ this.translate( 'No subscribed feeds found.' ) } /> );
			}
		}

		if ( this.state.windowWidth && this.state.windowWidth > 960 ) {
			searchPlaceholder = this.translate( 'Search your followed feeds' );
		} else {
			searchPlaceholder = this.translate( 'Search' );
		}

		return (
			<Main className="following-edit">
				<MobileBackToSidebar>
					<h1>{ this.translate( 'Manage Followed Sites' ) }</h1>
				</MobileBackToSidebar>
				{ this.renderFollowError() }
				{ this.renderUnfollowError() }
				<FollowingEditSubscribeForm
					onSearch={ this.handleNewSubscriptionSearch }
					onSearchClose={ this.handleNewSubscriptionSearchClose }
					onFollow={ this.handleFollow }
					initialSearchString={ this.props.initialFollowUrl } />
				<FollowingEditSortControls onSelectChange={ this.handleSortOrderChange } sortOrder={ this.state.sortOrder } />
				<Search
					key="existingFeedSearch"
					autoFocus={ false }
					additionalClasses="following-edit__existing-feed-search"
					placeholder={ searchPlaceholder }
					onSearch={ this.doSearch } initialValue={ this.props.search } delaySearch={ true } ref="url-search" />
				{ this.state.isAttemptingFollow && ! this.state.lastError ? <SubscriptionPlaceholder key={ 'placeholder-add-feed' } /> : null }
				{ subscriptionsToDisplay.length === 0 && this.props.search ?
					<NoResults text={ this.translate( 'No subscriptions match that search.' ) } /> :
				<InfiniteList role="main"
					items={ subscriptionsToDisplay }
					lastPage={ this.state.isLastPage }
					fetchingNextPage={ this.state.isLoading }
					guessedItemHeight={ 75 }
					fetchNextPage={ this.fetchNextPage }
					getItemRef= { this.getSubscriptionRef }
					renderItem={ this.renderSubscription }
					renderLoadingPlaceholders={ this.renderLoadingPlaceholders } />
				}
			</Main>
		);
	}

} );

module.exports = FollowingEdit;
