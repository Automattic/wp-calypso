var React = require( 'react' ),
	url = require( 'url' );

var EmptyContent = require( './empty' ),
	DocumentHead = require( 'components/data/document-head' ),
	Stream = require( 'reader/stream' ),
	FeedHeader = require( 'blocks/reader-feed-header' ),
	FeedStore = require( 'lib/feed-store' ),
	FeedStoreActions = require( 'lib/feed-store/actions' ),
	FeedStoreState = require( 'lib/feed-store/constants' ).state,
	FeedError = require( 'reader/feed-error' ),
	HeaderBack = require( 'reader/header-back' ),
	SiteStore = require( 'lib/reader-site-store' ),
	SiteState = require( 'lib/reader-site-store/constants' ).state;

var FeedStream = React.createClass( {

	getDefaultProps: function() {
		return { showBack: true };
	},

	getInitialState: function() {
		var feed = this.getFeed(),
			site = this.getSite( feed ),
			title = this.getTitle( feed, site );

		return {
			title,
			feed,
			site
		};
	},

	componentDidMount: function() {
		FeedStore.on( 'change', this.updateState );
		SiteStore.on( 'change', this.updateState );
	},

	componentWillUnmount: function() {
		FeedStore.off( 'change', this.updateState );
		SiteStore.off( 'change', this.updateState );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.feedId !== this.props.feedId ) {
			this.updateState();
		}
	},

	getTitle: function( feed, site ) {
		var title;

		if ( ! feed && ! site ) {
			return this.translate( 'Loading Feed' );
		}

		if ( feed.state === FeedStoreState.ERROR ) {
			title = this.translate( 'Error fetching feed' );
		} else if ( feed.state === FeedStoreState.COMPLETE ) {
			title = feed.name;
		}

		if ( ! title && site ) {
			title = site.get( 'name' );
		}

		if ( ! title && feed ) {
			title = feed.URL || feed.feed_URL;
			if ( title ) {
				title = url.parse( title ).hostname;
			}
		}

		if ( ! title && site ) {
			title = site.get( 'URL' );
			if ( title ) {
				title = url.parse( title ).hostname;
			}
		}

		if ( ! title ) {
			title = this.translate( 'Loading Feed' );
		}

		return title;
	},

	getFeed: function() {
		var feed = FeedStore.get( this.props.feedId );

		if ( ! feed ) {
			FeedStoreActions.fetch( this.props.feedId );
		}

		return feed;
	},

	getSite: function() {
		var feed = FeedStore.get( this.props.feedId ),
			site;
		if ( feed && feed.blog_ID ) {
			// this comes in via a meta request, so don't bother querying it
			site = SiteStore.get( feed.blog_ID );
			if ( site && site.get( 'state' ) !== SiteState.COMPLETE ) {
				site = null; // don't accept an incomplete or error site
			}
		}

		return site;
	},

	updateState: function() {
		var feed = this.getFeed(),
			site = this.getSite(),
			title = this.getTitle( feed, site ),
			newState = {};

		if ( feed !== this.state.feed ) {
			newState.feed = feed;
		}

		if ( title !== this.state.title ) {
			newState.title = title;
		}

		if ( site && site !== this.state.site ) {
			newState.site = site;
		}

		if ( Object.keys( newState ).length > 0 ) {
			this.setState( newState );
		}
	},

	render: function() {
		var feed = FeedStore.get( this.props.feedId ),
			emptyContent = ( <EmptyContent /> );

		if ( feed && feed.state === FeedStoreState.ERROR ) {
			return <FeedError sidebarTitle={ this.state.title } />;
		}

		return (
			<Stream { ...this.props } listName={ this.state.title } emptyContent={ emptyContent } showPostHeader={ false }>
				<DocumentHead title={ this.translate( '%s ‹ Reader', { args: this.state.title } ) } />
				{ this.props.showBack && <HeaderBack /> }
				<FeedHeader feed={ feed } site={ this.state.site } />
			</Stream>
		);
	}

} );

module.exports = FeedStream;
