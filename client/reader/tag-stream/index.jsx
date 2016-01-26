var React = require( 'react' );

var FollowingStream = require( 'reader/following-stream' ),
	EmptyContent = require( './empty' ),
	ReaderTags = require( 'lib/reader-tags/tags' ),
	ReaderTagActions = require( 'lib/reader-tags/actions' ),
	TagSubscriptions = require( 'lib/reader-tags/subscriptions' ),
	StreamHeader = require( 'reader/stream-header' ),
	stats = require( 'reader/stats' ),
	HeaderBack = require( 'reader/header-back' );

var FeedStream = React.createClass( {

	getInitialState: function() {
		return {
			title: this.getTitle(),
			subscribed: this.isSubscribed()
		};
	},

	componentDidMount: function() {
		ReaderTags.on( 'change', this.updateState );
		TagSubscriptions.on( 'change', this.updateState );
	},

	componentWillUnmount: function() {
		ReaderTags.off( 'change', this.updateState );
		TagSubscriptions.off( 'change', this.updateState );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.tag !== this.props.tag ) {
			this.updateState();
		}
	},

	updateState: function() {
		var newState = {
			title: this.getTitle(),
			subscribed: this.isSubscribed()
		};
		if ( newState.title !== this.state.title || newState.subscribed !== this.state.subscribed ) {
			this.setState( newState );
		}
	},

	getTitle: function() {
		var tag = ReaderTags.get( this.props.tag );
		if ( ! tag ) {
			ReaderTagActions.fetchTag( this.props.tag );
			return this.translate( 'Loading Tag' );
		}

		return tag.display_name || tag.slug;
	},

	isSubscribed: function() {
		var tag = ReaderTags.get( this.props.tag );
		if ( ! tag ) {
			return false;
		}
		return TagSubscriptions.isSubscribed( tag.slug );
	},

	toggleFollowing: function( isFollowing ) {
		var tag = ReaderTags.get( this.props.tag );
		ReaderTagActions[ isFollowing ? 'follow' : 'unfollow' ]( tag );
		stats.recordAction( isFollowing ? 'followed_topic' : 'unfollowed_topic' );
		stats.recordGaEvent( isFollowing ? 'Clicked Follow Topic' : 'Clicked Unfollow Topic', tag.slug );
		stats.recordTrack( isFollowing ? 'calypso_reader_reader_tag_followed' : 'calypso_reader_reader_tag_unfollowed', {
			tag: tag.slug
		} );
	},

	render: function() {
		var tag = ReaderTags.get( this.props.tag ),
			emptyContent = ( <EmptyContent /> );

		if ( this.props.setPageTitle ) {
			this.props.setPageTitle( this.state.title );
		}
		return (
			<FollowingStream { ...this.props } listName={ this.state.title } emptyContent={ emptyContent } showFollowInHeader={ true } >
				{ this.props.showBack && <HeaderBack /> }
				<StreamHeader
					isPlaceholder={ ! tag }
					icon={ <svg className="gridicon gridicon__tag" height="32" width="32" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M16 7H5c-1.105 0-2 .896-2 2v6c0 1.104.895 2 2 2h11l5-5-5-5z"/></g></svg> }
					title={ this.state.title }
					showFollow={ true }
					following={ this.state.subscribed }
					onFollowToggle={ this.toggleFollowing } />
			</FollowingStream>
		);
	}

} );

module.exports = FeedStream;
