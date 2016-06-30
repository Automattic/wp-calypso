// External dependencies
import React from 'react';
import times from 'lodash/times';
import trimStart from 'lodash/trimStart';
import Immutable from 'immutable';
import debounce from 'lodash/debounce';
import remove from 'lodash/remove';
import classnames from 'classnames';

// Internal dependencies
import Main from 'components/main';
import Gridicon from 'components/gridicon';
import FeedSubscriptionStore from 'lib/reader-feed-subscriptions';
import SiteStore from 'lib/reader-site-store';
import FeedStore from 'lib/feed-store';
import FeedSubscriptionActions from 'lib/reader-feed-subscriptions/actions';
import EmptyContent from './empty';
import NoResults from 'my-sites/no-results';
import InfiniteList from 'components/infinite-list';
import SubscriptionPlaceholder from './placeholder';
import SubscriptionListItem from './list-item';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import SearchCard from 'components/search-card';
import URLSearch from 'lib/mixins/url-search';
import FollowingEditSubscribeForm from './subscribe-form';
import { error as FeedSubscriptionErrorTypes } from 'lib/reader-feed-subscriptions/constants';
import MobileBackToSidebar from 'components/mobile-back-to-sidebar';
import smartSetState from 'lib/react-smart-set-state';
import escapeRegexp from 'escape-string-regexp';
import FollowingEditSortControls from './sort-controls';
import FollowingExportButton from './export-button';
import FollowingImportButton from './import-button';
import FeedDisplayHelper from 'reader/lib/feed-display-helper';
import SectionHeader from 'components/section-header';
import Button from 'components/button';
const stats = require( 'reader/stats' );

const initialLoadFeedCount = 20;

const FollowingEdit = React.createClass( {

	mixins: [ URLSearch ],

	propTypes: {
		initialFollowUrl: React.PropTypes.string,
		search: React.PropTypes.string,
		userSettings: React.PropTypes.object
	},

	getInitialState: function() {
		return Object.assign( {
			notices: [],
			isSearching: !! this.props.search,
		}, this.getStateFromStores() );
	},

	getDefaultProps: function() {
		return {
			initialFollowUrl: ''
		};
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
			return item.get( 'URL' ).search( phraseRe ) !== -1 ||
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
					displayUrl = FeedDisplayHelper.formatUrlForDisplay( subscription.get( 'URL' ) );
				return trimStart( FeedDisplayHelper.getFeedTitle( site, feed, displayUrl ).toLowerCase() );
			} );
		}

		return subscriptions.sortBy( function( subscription ) {
			return subscription.get( 'date_subscribed' );
		} ).reverse();
	},

	handleAdd: function( newSubscription ) {
		let newState = {
			isAttemptingFollow: false,
			isAddingOpen: false
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

	handleFeedExport( fileName ) {
		this.dismissFeedExportNotice();
		if ( this.state.feedExportError ) {
			this.dismissFeedImportExportError();
		}

		const notices = this.state.notices;
		notices.push( 'renderFeedExportNotice' );

		this.setState( {
			feedExport: fileName,
			notices: notices
		} );
	},

	handleFeedExportError( error ) {
		this.dismissFeedImportExportError();
		if ( this.state.feedExport ) {
			this.dismissFeedExportNotice();
		}

		const notices = this.state.notices;
		notices.push( 'renderFeedImportExportError' );

		this.setState( {
			notices: notices,
			feedExportError: error
		} );
	},

	handleFeedImport( data ) {
		this.dismissFeedImportNotice();
		if ( this.state.feedImportError ) {
			this.dismissFeedImportExportError();
		}

		const notices = this.state.notices;
		notices.push( 'renderFeedImportNotice' );

		this.setState( {
			notices: notices,
			feedImport: data
		} );
	},

	handleFeedImportError( error ) {
		this.dismissFeedImportExportError();
		if ( this.state.feedImport ) {
			this.dismissFeedImportNotice();
		}

		const notices = this.state.notices;
		notices.push( 'renderFeedImportExportError' );

		this.setState( {
			notices: notices,
			feedImportError: error
		} );
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
		const isEmailBlocked = this.props.userSettings.getSetting( 'subscription_delivery_email_blocked' );

		return (
			<SubscriptionListItem
				ref={ subscriptionKey }
				key={ subscriptionKey }
				subscription={ subscription }
				onNotificationSettingsOpen={ this.handleNotificationSettingsOpen }
				onNotificationSettingsClose={ this.handleNotificationSettingsClose }
				openCards={ this.state.openCards }
				isEmailBlocked={ isEmailBlocked } />
		);
	},

	renderLoadingPlaceholders: function() {
		var count = this.state.subscriptions.size ? 10 : initialLoadFeedCount;
		return times( count, function( i ) {
			return ( <SubscriptionPlaceholder key={ 'placeholder-' + i } /> );
		} );
	},

	dismissError: function( event ) {
		event.preventDefault();

		// Call originating store and mark error as dismissed
		FeedSubscriptionActions.dismissError( this.state.lastError );
		this.setState( { isAttemptingFollow: false } );
		stats.recordAction( 'dismiss_follow_error' );
		stats.recordGaEvent( 'Clicked Dismiss Follow Error' );
		stats.recordTrack( 'calypso_reader_follow_error_dismissed' );
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

	dismissFeedExportNotice() {
		const notices = this.state.notices;
		remove( notices, ( f ) => f === 'renderFeedExportNotice' );
		this.setState( {
			notices: notices,
			feedExport: null
		} );
	},

	dismissFeedImportNotice() {
		const notices = this.state.notices;
		remove( notices, ( f ) => f ===	'renderFeedImportNotice' );
		this.setState( {
			notices: notices,
			feedImport: null,
		} );
	},

	dismissFeedImportExportError() {
		const notices = this.state.notices;
		remove( notices, ( f ) => f === 'renderFeedImportExportError' );
		this.setState( {
			notices: notices,
			feedImportError: null,
			feedExportError: null
		} );
	},

	handleNewSubscriptionSearchClose: function() {
		this.toggleAddSite();

		if ( this.state.lastError && this.state.lastError.errorType === FeedSubscriptionErrorTypes.UNABLE_TO_FOLLOW ) {
			this.setState( { isAttemptingFollow: false } );
			FeedSubscriptionActions.dismissError( this.state.lastError );
		}
	},

	handleFollow: function( newUrl ) {
		this.toggleAddSite();
		this.setState( { isAttemptingFollow: true } );
		stats.recordFollow( newUrl );
	},

	renderUnfollowError: function() {
		if ( ! this.state.lastError || this.state.lastError.errorType !== FeedSubscriptionErrorTypes.UNABLE_TO_UNFOLLOW ) {
			return null;
		}

		const url = this.state.lastError.URL;

		return ( <Notice
					status="is-error"
					showDismiss={ true }
					onDismissClick={ this.dismissError }>
					{ this.translate( 'Sorry - there was a problem unfollowing {{strong}}%(url)s{{/strong}}.', {
						components: { strong: <strong /> },
						args: { url: url } } )
					}
					</Notice>
		);
	},

	renderFollowError: function() {
		if ( ! this.state.lastError || this.state.lastError.errorType !== FeedSubscriptionErrorTypes.UNABLE_TO_FOLLOW ) {
			return null;
		}

		const lastError = this.state.lastError;
		let errorMessage;

		if ( lastError.info && lastError.info === 'already_subscribed' ) {
			errorMessage = this.translate( 'You\'re already subscribed to that site.' );
		} else {
			errorMessage = this.translate( 'Sorry, we couldn\'t find a feed for {{em}}%(url)s{{/em}}.', {
				args: { url: this.state.searchString },
				components: { em: <em/> }
			} );
		}

		return ( <Notice
					status="is-error"
					showDismiss={ true }
					onDismissClick={ this.dismissError }>
					{ errorMessage }
				</Notice>
		);
	},

	renderFeedExportNotice() {
		const feedExport = this.state.feedExport;
		if ( ! feedExport ) return null;

		const message = this.translate( 'Your Followed Sites list has been exported.' );
		return (
			<Notice
				key="notice-feed-export"
				status="is-success"
				showDismiss={ true }
				onDismissClick={ this.dismissFeedExportNotice }
				text={ message }>
			</Notice>
		);
	},

	renderFeedImportNotice() {
		const feedImport = this.state.feedImport;
		if ( ! feedImport ) return null;

		const message = this.translate( '{{em}}%(name)s{{/em}} has been imported. Refresh this page to see the new sites you follow.', {
			args: { name: feedImport.fileName },
			components: { em: <em/> }
		} );
		return (
			<Notice
				key="notice-feed-import"
				status="is-success"
				showDismiss={ false }
				onDismissClick={ this.dismissFeedImportNotice }
				text={ message }>
				<NoticeAction href="#" onClick={ this.refresh }>
					Refresh
				</NoticeAction>
			</Notice>
		);
	},

	renderFeedImportExportError() {
		const error = this.state.feedImportError || this.state.feedExportError;
		if ( ! error ) return null;

		const message = this.translate( 'Whoops, something went wrong. %(message)s. Please try again.', {
			args: { message: error.message }
		} );
		return (
			<Notice
				key="notice-feed-import-export"
				status="is-error"
				text={ message }
				onDismissClick={ this.dismissFeedImportExportError }
				showDismiss={ true }>
			</Notice>
		);
	},

	refresh() {
		location.reload();
	},

	toggleAddSite: function() {
		this.refs[ 'feed-search' ].focus();
	},

	toggleSearching() {
		var isSearching = ! this.state.isSearching;
		this.setState( {
			isSearching: isSearching
		} );
		if ( isSearching ) {
			this.refs[ 'url-search' ].focus();
		}
	},

	renderNotices() {
		return this.state.notices.map( ( funcName ) => this[ funcName ]() );
	},

	render: function() {
		let subscriptions = this.state.subscriptions,
			subscriptionsToDisplay = [],
			searchPlaceholder = '',
			hasNoSubscriptions = false;

		// We're only interested in showing subscriptions with an ID (i.e. those that came from the API)
		// At this point we may have some kicking around that just have a URL, such as those added when
		// the following stream was processed
		if ( subscriptions ) {
			subscriptionsToDisplay = subscriptions.filter( function( subscription ) {
				return subscription.has( 'ID' );
			} ).toArray();
		}

		if ( subscriptionsToDisplay.length === 0 && this.state.isLastPage && ! this.props.search ) {
			hasNoSubscriptions = true;
		}

		if ( this.state.windowWidth && this.state.windowWidth > 960 ) {
			searchPlaceholder = this.translate( 'Search your followed sites' );
		} else {
			searchPlaceholder = this.translate( 'Search' );
		}

		const containerClasses = classnames( {
			'is-searching': this.state.isSearching,
			'has-no-subscriptions': hasNoSubscriptions
		}, 'following-edit' );

		return (
			<Main className={ containerClasses }>
				<MobileBackToSidebar>
					<h1>{ this.translate( 'Manage Followed Sites' ) }</h1>
				</MobileBackToSidebar>
				{ this.renderFollowError() }
				{ this.renderUnfollowError() }
				{ this.renderNotices() }

				<FollowingEditSubscribeForm
					onSearch={ this.handleNewSubscriptionSearch }
					onSearchClose={ this.handleNewSubscriptionSearchClose }
					onFollow={ this.handleFollow }
					initialSearchString={ this.props.initialFollowUrl }
					isSearchOpen={ this.state.isAddingOpen }
					ref="feed-search" />

				<SectionHeader className="following-edit__header" label={ this.translate( 'Sites' ) } count={ this.state.totalSubscriptions }>
					{ ! hasNoSubscriptions
							? <FollowingExportButton
									onExport={ this.handleFeedExport }
									onError={ this.handleFeedExportError } />
							: null }
					<FollowingImportButton
						onImport={ this.handleFeedImport }
						onError={ this.handleFeedImportError } />
					{ ! hasNoSubscriptions
							? <FollowingEditSortControls onSelectChange={ this.handleSortOrderChange } sortOrder={ this.state.sortOrder } />
							: null }
					{ ! hasNoSubscriptions
							? <Button
								borderless
								className="following-edit__search"
								aria-label={ this.translate( 'Open Search', { context: 'button label' } ) }
								onClick={ this.toggleSearching }>
								<Gridicon icon="search" />
							  </Button>
							: null }
				</SectionHeader>

				{ ! hasNoSubscriptions ? <SearchCard
					isOpen={ true }
					pinned={ true }
					key="existingFeedSearch"
					autoFocus={ false }
					additionalClasses="following-edit__existing-feed-search"
					placeholder={ searchPlaceholder }
					onSearch={ this.doSearch }
					onSearchClose={ this.toggleSearching }
					initialValue={ this.props.search }
					delaySearch={ true }
					ref="url-search" /> : null }

				{ this.state.isAttemptingFollow && ! this.state.lastError ? <SubscriptionPlaceholder key={ 'placeholder-add-feed' } /> : null }
				{ subscriptionsToDisplay.length === 0 && this.props.search && ! this.state.isLoading
					? <NoResults text={ this.translate( 'No subscriptions match that search.' ) } />
					: <InfiniteList className="following-edit__sites"
						items={ subscriptionsToDisplay }
						lastPage={ this.state.isLastPage }
						fetchingNextPage={ this.state.isLoading }
						guessedItemHeight={ 75 }
						fetchNextPage={ this.fetchNextPage }
						getItemRef= { this.getSubscriptionRef }
						renderItem={ this.renderSubscription }
						renderLoadingPlaceholders={ this.renderLoadingPlaceholders } />
				}

				{ hasNoSubscriptions ? <EmptyContent /> : null }
			</Main>
		);
	}

} );

module.exports = FollowingEdit;
