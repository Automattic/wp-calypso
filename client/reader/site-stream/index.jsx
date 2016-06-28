var React = require( 'react' ),
	page = require( 'page' ),
	includes = require( 'lodash/includes' );

var FeedHeader = require( 'reader/feed-header' ),
	FeedFeatured = require( './featured' ),
	EmptyContent = require( './empty' ),
	Stream = require( 'reader/stream' ),
	HeaderBack = require( 'reader/header-back' ),
	SiteStore = require( 'lib/reader-site-store' ),
	SiteStoreActions = require( 'lib/reader-site-store/actions' ),
	SiteState = require( 'lib/reader-site-store/constants' ).state,
	FeedError = require( 'reader/feed-error' ),
	FeedStore = require( 'lib/feed-store' ),
	FeedStoreActions = require( 'lib/feed-store/actions' ),
	FeedState = require( 'lib/feed-store/constants' ).state,
	FeedStreamStoreActions = require( 'lib/feed-stream-store/actions' ),
	feedStreamFactory = require( 'lib/feed-stream-store' ),
	smartSetState = require( 'lib/react-smart-set-state' );

function checkForRedirect( site ) {
	if ( site && site.get( 'prefer_feed' ) && site.get( 'feed_ID' ) ) {
		setTimeout( function() {
			page.replace( '/read/feeds/' + site.get( 'feed_ID' ) );
		}, 0 );
	}
}

const SiteStream = React.createClass( {

	getDefaultProps: function() {
		return { showBack: true };
	},

	getInitialState: function() {
		return this.getState();
	},

	componentDidMount: function() {
		SiteStore.on( 'change', this.updateState );
		FeedStore.on( 'change', this.updateState );
	},

	componentWillUnmount: function() {
		SiteStore.off( 'change', this.updateState );
		FeedStore.off( 'change', this.updateState );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId ) {
			this.updateState( nextProps );
		}
	},

	smartSetState: smartSetState,

	getState: function( props = this.props ) {
		const { site, feed } = this.getSiteAndFeed( props.siteId );
		checkForRedirect( site );

		let state = {
			feed: feed,
			site: site,
			title: this.getTitle( site )
		};

		return state;
	},

	updateState: function( props = this.props ) {
		var state = this.getState( props );
		checkForRedirect( state.site );
		this.smartSetState( state );
	},

	getSiteAndFeed: function( siteId ) {
		var site = SiteStore.get( siteId ),
			feed;

		if ( ! site ) {
			SiteStoreActions.fetch( siteId );
		}

		if ( site && ! includes( [ SiteState.COMPLETE, SiteState.ERROR ], site.get( 'state' ) ) ) {
			site = null; // don't accept an incomplete site
		}

		if ( site && site.get( 'state' ) === SiteState.COMPLETE && site.get( 'feed_ID' ) ) {
			feed = FeedStore.get( site.get( 'feed_ID' ) );
			if ( ! feed ) {
				setTimeout( () => {
					FeedStoreActions.fetch( site.get( 'feed_ID' ) );
				}, 0 );
			} else if ( feed.state !== FeedState.COMPLETE ) {
				feed = null;
			}
		}

		return { site, feed };
	},

	getTitle: function( site ) {
		if ( ! site ) {
			return;
		}
		if ( site.get( 'state' ) === SiteState.COMPLETE ) {
			return site.get( 'title' ) || site.get( 'domain' );
		} else if ( site.get( 'state' ) === SiteState.ERROR ) {
			return this.translate( 'Error fetching site' );
		}
	},

	goBack: function() {
		if ( typeof window !== 'undefined' ) {
			window.history.back();
		}
	},

	render: function() {
		var site = this.state.site,
			title = this.state.title,
			emptyContent = ( <EmptyContent /> ),
			featuredStore = null,
			featuredContent = null;

		if ( ! title ) {
			title = this.translate( 'Loading Site' );
		}

		if ( this.props.setPageTitle ) {
			this.props.setPageTitle( title );
		}

		if ( site && site.get( 'state' ) === SiteState.ERROR ) {
			return <FeedError sidebarTitle={ title } />;
		}

		if ( site && site.get( 'has_featured' ) ) {
			featuredStore = feedStreamFactory( 'featured:' + site.get( 'ID' ) );
			setTimeout( () => FeedStreamStoreActions.fetchNextPage( featuredStore.id ), 0 ); // timeout to prevent invariant violations
			featuredContent = ( <FeedFeatured store={ featuredStore } /> );
		}

		return (
			<Stream { ...this.props } listName={ title } emptyContent={ emptyContent } showPostHeader={ false }>
				{ this.props.showBack && <HeaderBack /> }
				<FeedHeader site={ this.state.site } feed={ this.state.feed }/>
				{ featuredContent }
			</Stream>

		);
	}

} );

module.exports = SiteStream;
