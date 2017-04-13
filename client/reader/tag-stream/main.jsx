/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import Stream from 'reader/stream';
import DocumentHead from 'components/data/document-head';
import EmptyContent from './empty';
import TagStreamHeader from './header';
import {
	recordAction,
	recordGaEvent,
	recordTrack,
} from 'reader/stats';
import HeaderBack from 'reader/header-back';
import { getReaderFollowedTags, getReaderTags } from 'state/selectors';
import { requestFollowTag, requestUnfollowTag } from 'state/reader/tags/items/actions';
import QueryReaderFollowedTags from 'components/data/query-reader-followed-tags';
import QueryReaderTag from 'components/data/query-reader-tag';
import { find } from 'lodash';

const TagStream = React.createClass( {

	_isMounted: false,

	propTypes: {
		tag: React.PropTypes.string, // the tag slug encoded
		decodedTag: React.PropTypes.string, // decoded tag slug
	},

	getInitialState() {
		return {
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
				const title = self.getTitle();
				self.setState( {
					twemoji,
					isEmojiTitle: title && twemoji.test( title )
				} );
			}
		} );
	},

	componentWillUnmount() {
		this._isMounted = false;
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.tag !== this.props.tag ) {
			this.checkForTwemoji( nextProps );
		}
	},

	checkForTwemoji() {
		const title = this.getTitle();
		this.setState( {
			isEmojiTitle: title && this.state.twemoji && this.state.twemoji.test( title )
		} );
	},

	getTitle() {
		return decodeURIComponent( this.props.tag );
	},

	isSubscribed() {
		const tag = find( this.props.tags, { slug: this.props.tag } );
		return !! ( tag && tag.isFollowing );
	},

	toggleFollowing() {
		const { tag, decodedTag, unfollowTag, followTag } = this.props;
		const isFollowing = this.isSubscribed(); // this is the current state, not the new state
		const toggleAction = isFollowing ? unfollowTag : followTag;
		toggleAction( decodedTag );
		recordAction( isFollowing ? 'unfollowed_topic' : 'followed_topic' );
		recordGaEvent( isFollowing ? 'Clicked Unfollow Topic' : 'Clicked Follow Topic', tag );
		recordTrack( isFollowing ? 'calypso_reader_reader_tag_unfollowed' : 'calypso_reader_reader_tag_followed', {
			tag
		} );
	},

	render() {
		const emptyContent = ( <EmptyContent tag={ this.props.tag } /> );
		const title = this.getTitle();
		const tag = find( this.props.tags, { slug: this.props.tag } );

		let imageSearchString = this.props.tag;

		// If the tag contains emoji, convert to text equivalent
		if ( this.state.emojiText && this.state.isEmojiTitle ) {
			imageSearchString = this.state.emojiText.convert( title, {
				delimiter: ''
			} );
		}

		return (
			<Stream { ...this.props } listName={ this.state.title } emptyContent={ emptyContent } showFollowInHeader={ true } >
				<QueryReaderFollowedTags />
				<QueryReaderTag tag={ this.props.decodedTag } />
				<DocumentHead title={ this.translate( '%s ‹ Reader', { args: title } ) } />
				{ this.props.showBack && <HeaderBack /> }
				<TagStreamHeader
					tag={ this.props.tag }
					title={ this.getTitle() }
					imageSearchString={ imageSearchString }
					showFollow={ !! ( tag && tag.id ) }
					following={ this.isSubscribed() }
					onFollowToggle={ this.toggleFollowing }
					showBack={ this.props.showBack } />
			</Stream>
		);
	}
} );

export default connect(
	state => ( {
		followedTags: getReaderFollowedTags( state ),
		tags: getReaderTags( state ),
	} ),
	{
		followTag: requestFollowTag,
		unfollowTag: requestUnfollowTag,
	}
)( TagStream );
