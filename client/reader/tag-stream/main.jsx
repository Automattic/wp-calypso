/**
 * External Dependencies
 */
import React from 'react';
import { has } from 'lodash';

/**
 * Internal Dependencies
 */
import Stream from 'reader/stream';
import DocumentHead from 'components/data/document-head';
import EmptyContent from './empty';
import ReaderTags from 'lib/reader-tags/tags';
import ReaderTagActions from 'lib/reader-tags/actions';
import TagSubscriptions from 'lib/reader-tags/subscriptions';
import TagStreamHeader from './header';
import smartSetState from 'lib/react-smart-set-state';
import * as stats from 'reader/stats';
import HeaderBack from 'reader/header-back';

const TagStream = React.createClass( {

	_isMounted: false,

	propTypes: {
		tag: React.PropTypes.string
	},

	smartSetState: smartSetState,

	getInitialState() {
		const title = this.getTitle();
		return {
			title,
			subscribed: this.isSubscribed(),
			canFollow: has( ReaderTags.get( this.props.tag ), 'ID' ),
			isEmojiTitle: false
		};
	},

	componentWillMount() {
		const self = this;
		this._isMounted = true;
		// can't use arrows with asyncRequire
		asyncRequire( 'emoji-text', function( emojiText ) {
			if ( self._isMounted ) {
				self.setState( { emojiText } );
			}
		} );
		asyncRequire( 'twemoji', function( twemoji ) {
			if ( self._isMounted ) {
				const title = self.state && self.state.title;
				self.setState( {
					twemoji,
					isEmojiTitle: title && twemoji.test( title )
				} );
			}
		} );
	},

	componentDidMount() {
		ReaderTags.on( 'change', this.updateState );
		TagSubscriptions.on( 'change', this.updateState );
	},

	componentWillUnmount() {
		this._isMounted = false;
		ReaderTags.off( 'change', this.updateState );
		TagSubscriptions.off( 'change', this.updateState );
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.tag !== this.props.tag ) {
			this.updateState( nextProps );
		}
	},

	updateState( props = this.props ) {
		const title = this.getTitle( props );
		const newState = {
			title,
			subscribed: this.isSubscribed( props ),
			canFollow: has( ReaderTags.get( props.tag ), 'ID' ),
			isEmojiTitle: title && this.state.twemoji && this.state.twemoji.test( title )
		};
		this.smartSetState( newState );
	},

	getTitle( props = this.props ) {
		const tag = ReaderTags.get( props.tag );
		if ( ! ( tag && tag.ID ) ) {
			ReaderTagActions.fetchTag( props.tag );
			return props.tag;
		}

		return decodeURIComponent( tag.display_name || tag.slug );
	},

	isSubscribed( props = this.props ) {
		const tag = ReaderTags.get( props.tag );
		if ( ! tag ) {
			return false;
		}
		return TagSubscriptions.isSubscribed( tag.slug );
	},

	toggleFollowing( isFollowing ) {
		const tag = ReaderTags.get( this.props.tag );
		ReaderTagActions[ isFollowing ? 'follow' : 'unfollow' ]( tag );
		stats.recordAction( isFollowing ? 'followed_topic' : 'unfollowed_topic' );
		stats.recordGaEvent( isFollowing ? 'Clicked Follow Topic' : 'Clicked Unfollow Topic', tag.slug );
		stats.recordTrack( isFollowing ? 'calypso_reader_reader_tag_followed' : 'calypso_reader_reader_tag_unfollowed', {
			tag: tag.slug
		} );
	},

	render() {
		const emptyContent = ( <EmptyContent tag={ this.props.tag } /> );
		const title = decodeURIComponent( this.state.title );

		let imageSearchString = this.props.tag;

		// If the tag contains emoji, convert to text equivalent
		if ( this.state.emojiText && this.state.isEmojiTitle ) {
			imageSearchString = this.state.emojiText.convert( title, {
				delimiter: ''
			} );
		}

		return (
			<Stream { ...this.props } listName={ this.state.title } emptyContent={ emptyContent } showFollowInHeader={ true } >
				<DocumentHead title={ this.translate( '%s ‹ Reader', { args: title } ) } />
				{ this.props.showBack && <HeaderBack /> }
				<TagStreamHeader
					tag={ this.props.tag }
					title={ title }
					imageSearchString={ imageSearchString }
					showFollow={ this.state.canFollow }
					following={ this.state.subscribed }
					onFollowToggle={ this.toggleFollowing }
					showBack={ this.props.showBack } />
			</Stream>
		);
	}
} );

export default TagStream;
