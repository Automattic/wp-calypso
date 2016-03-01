/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import FollowingStream from 'reader/following-stream';
import EmptyContent from './empty';
import ReaderTags from 'lib/reader-tags/tags';
import ReaderTagActions from 'lib/reader-tags/actions';
import TagSubscriptions from 'lib/reader-tags/subscriptions';
import StreamHeader from 'reader/stream-header';
import HeaderBack from 'reader/header-back';

const stats = require( 'reader/stats' );

const FeedStream = React.createClass( {

	propTypes: {
		tag: React.PropTypes.string
	},

	getInitialState() {
		return {
			title: this.getTitle(),
			subscribed: this.isSubscribed()
		};
	},

	componentDidMount() {
		ReaderTags.on( 'change', this.updateState );
		TagSubscriptions.on( 'change', this.updateState );
	},

	componentWillUnmount() {
		ReaderTags.off( 'change', this.updateState );
		TagSubscriptions.off( 'change', this.updateState );
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.tag !== this.props.tag ) {
			this.updateState();
		}
	},

	updateState() {
		var newState = {
			title: this.getTitle(),
			subscribed: this.isSubscribed()
		};
		if ( newState.title !== this.state.title || newState.subscribed !== this.state.subscribed ) {
			this.setState( newState );
		}
	},

	getTitle() {
		var tag = ReaderTags.get( this.props.tag );
		if ( ! tag ) {
			ReaderTagActions.fetchTag( this.props.tag );
			return this.props.tag;
		}

		return tag.display_name || tag.slug;
	},

	isSubscribed() {
		var tag = ReaderTags.get( this.props.tag );
		if ( ! tag ) {
			return false;
		}
		return TagSubscriptions.isSubscribed( tag.slug );
	},

	toggleFollowing( isFollowing ) {
		var tag = ReaderTags.get( this.props.tag );
		ReaderTagActions[ isFollowing ? 'follow' : 'unfollow' ]( tag );
		stats.recordAction( isFollowing ? 'followed_topic' : 'unfollowed_topic' );
		stats.recordGaEvent( isFollowing ? 'Clicked Follow Topic' : 'Clicked Unfollow Topic', tag.slug );
		stats.recordTrack( isFollowing ? 'calypso_reader_reader_tag_followed' : 'calypso_reader_reader_tag_unfollowed', {
			tag: tag.slug
		} );
	},

	render() {
		const tag = ReaderTags.get( this.props.tag ) || { slug: this.props.tag },
			emptyContent = ( <EmptyContent tag={ this.props.tag } /> ),
			isFollowPossible = !! tag.ID;

		if ( this.props.setPageTitle ) {
			this.props.setPageTitle( this.state.title );
		}

		return (
			<FollowingStream { ...this.props } listName={ this.state.title } emptyContent={ emptyContent } showFollowInHeader={ true } >
				{ this.props.showBack && <HeaderBack /> }
				<StreamHeader
					isPlaceholder={ false }
					icon={ <svg className="gridicon gridicon__tag" height="32" width="32" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M16 7H5c-1.105 0-2 .896-2 2v6c0 1.104.895 2 2 2h11l5-5-5-5z"/></g></svg> }
					title={ this.state.title }
					showFollow={ isFollowPossible }
					following={ this.state.subscribed }
					onFollowToggle={ this.toggleFollowing } />
			</FollowingStream>
		);
	}
} );

export default FeedStream;
