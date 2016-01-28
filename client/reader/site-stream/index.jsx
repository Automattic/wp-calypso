var React = require( 'react' ),
	page = require( 'page' );

var FeedHeader = require( 'reader/feed-header' ),
	FeedFeatured = require( './featured' ),
	EmptyContent = require( './empty' ),
	FollowingStream = require( 'reader/following-stream' ),
	HeaderBack = require( 'reader/header-back' ),
	SiteStore = require( 'lib/reader-site-store' ),
	SiteStoreActions = require( 'lib/reader-site-store/actions' ),
	SiteState = require( 'lib/reader-site-store/constants' ).state,
	FeedError = require( 'reader/feed-error' ),
	FeedStreamStoreActions = require( 'lib/feed-stream-store/actions' ),
	feedStreamFactory = require( 'lib/feed-stream-store' );

function checkForRedirect( site ) {
	if ( site && site.get( 'prefer_feed' ) && site.get( 'feed_ID' ) ) {
		setTimeout( function() {
			page.replace( '/read/blog/feed/' + site.get( 'feed_ID' ) )
		}, 0 );
	}
}

const SiteStream = React.createClass( {

	getDefaultProps: function() {
		return { showBack: true };
	},

	getInitialState: function() {
		const site = SiteStore.get( this.props.siteId );
		checkForRedirect( site );
		return {
			site: SiteStore.get( this.props.siteId ),
			title: this.getTitle()
		};
	},

	componentDidMount: function() {
		SiteStore.on( 'change', this.updateState );
	},

	componentWillUnmount: function() {
		SiteStore.off( 'change', this.updateState );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId ) {
			this.updateState();
		}
	},

	updateState: function() {
		var site = SiteStore.get( this.props.siteId ),
			newTitle = this.getTitle();
		checkForRedirect( site );
		if ( newTitle !== this.state.title || site !== this.state.site ) {
			this.setState( {
				title: newTitle,
				site: site
			} );
		}
	},

	getSite: function() {
		var site = SiteStore.get( this.props.siteId );

		if ( ! site ) {
			SiteStoreActions.fetch( this.props.siteId );
		}

		if ( site && site.get( 'state' ) !== SiteState.COMPLETE ) {
			site = null; // don't accept an incomplete or error site
		}

		return site;
	},

	getTitle: function() {
		var site = this.getSite();
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
			return <FeedError listName={ title } />;
		}

		if ( site && site.get( 'has_featured' ) ) {
			featuredStore = feedStreamFactory( 'featured:' + site.get( 'ID' ) );
			setTimeout( () => FeedStreamStoreActions.fetchNextPage( featuredStore.id ), 0 ); // timeout to prevent invariant violations
			featuredContent = ( <FeedFeatured store={ featuredStore } /> );
		}

		return (
			<FollowingStream { ...this.props } listName={ title } emptyContent={ emptyContent }>
				{ this.props.showBack && <HeaderBack /> }
				<FeedHeader site={ this.state.site } />
				{ featuredContent }
			</FollowingStream>

		);
	}

} );

module.exports = SiteStream;
