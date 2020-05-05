/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { find } from 'lodash';

/**
 * Internal Dependencies
 */
import Stream from 'reader/stream';
import DocumentHead from 'components/data/document-head';
import EmptyContent from './empty';
import TagStreamHeader from './header';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';
import HeaderBack from 'reader/header-back';
import { getReaderTags, getReaderFollowedTags } from 'state/reader/tags/selectors';
import { requestFollowTag, requestUnfollowTag } from 'state/reader/tags/items/actions';
import QueryReaderFollowedTags from 'components/data/query-reader-followed-tags';
import QueryReaderTag from 'components/data/query-reader-tag';

/**
 * Style dependencies
 */
import './style.scss';

class TagStream extends React.Component {
	static propTypes = {
		encodedTagSlug: PropTypes.string,
		decodedTagSlug: PropTypes.string,
		followSource: PropTypes.string.isRequired,
	};

	state = {
		isEmojiTitle: false,
	};

	_isMounted = false;

	componentDidMount() {
		const self = this;
		this._isMounted = true;
		// can't use arrows with asyncRequire
		asyncRequire( 'emoji-text', function ( emojiText ) {
			if ( self._isMounted ) {
				self.setState( { emojiText } );
			}
		} );
		asyncRequire( 'twemoji', function ( twemoji ) {
			if ( self._isMounted ) {
				const title = self.props.decodedTagSlug;
				self.setState( {
					twemoji,
					isEmojiTitle: title && twemoji.test( title ),
				} );
			}
		} );
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	static getDerivedStateFromProps( nextProps, prevState ) {
		if ( ! prevState.twemoji || ! nextProps.decodedTagSlug ) {
			return null;
		}

		return {
			isEmojiTitle: prevState.twemoji.test( nextProps.decodedTagSlug ),
		};
	}

	isSubscribed = () => {
		const tag = find( this.props.tags, { slug: this.props.encodedTagSlug } );
		return !! ( tag && tag.isFollowing );
	};

	toggleFollowing = () => {
		const { decodedTagSlug, unfollowTag, followTag } = this.props;
		const isFollowing = this.isSubscribed(); // this is the current state, not the new state
		const toggleAction = isFollowing ? unfollowTag : followTag;
		toggleAction( decodedTagSlug );
		recordAction( isFollowing ? 'unfollowed_topic' : 'followed_topic' );
		recordGaEvent(
			isFollowing ? 'Clicked Unfollow Topic' : 'Clicked Follow Topic',
			decodedTagSlug
		);
		recordTrack(
			isFollowing ? 'calypso_reader_reader_tag_unfollowed' : 'calypso_reader_reader_tag_followed',
			{
				tag: decodedTagSlug,
			}
		);
	};

	render() {
		const emptyContent = <EmptyContent decodedTagSlug={ this.props.decodedTagSlug } />;
		const title = this.props.decodedTagSlug;
		const tag = find( this.props.tags, { slug: this.props.encodedTagSlug } );

		let imageSearchString = this.props.encodedTagSlug;

		// If the tag contains emoji, convert to text equivalent
		if ( this.state.emojiText && this.state.isEmojiTitle ) {
			imageSearchString = this.state.emojiText.convert( title, {
				delimiter: '',
			} );
		}

		if ( tag && tag.error ) {
			return (
				<React.Fragment>
					<QueryReaderFollowedTags />
					<QueryReaderTag tag={ this.props.decodedTagSlug } />
					{ this.props.showBack && <HeaderBack /> }
					<TagStreamHeader
						title={ title }
						imageSearchString={ imageSearchString }
						showFollow={ false }
						showBack={ this.props.showBack }
					/>
					<EmptyContent />
				</React.Fragment>
			);
		}

		return (
			<Stream
				{ ...this.props }
				listName={ this.state.title }
				emptyContent={ emptyContent }
				showFollowInHeader={ true }
				forcePlaceholders={ ! tag } // if tag hasn't loaded yet, then make everything a placeholder
			>
				<QueryReaderFollowedTags />
				<QueryReaderTag tag={ this.props.decodedTagSlug } />
				<DocumentHead
					title={ this.props.translate( '%s ‹ Reader', {
						args: title,
						comment: '%s is the section name. For example: "My Likes"',
					} ) }
				/>
				{ this.props.showBack && <HeaderBack /> }
				<TagStreamHeader
					title={ title }
					imageSearchString={ imageSearchString }
					showFollow={ !! ( tag && tag.id ) }
					following={ this.isSubscribed() }
					onFollowToggle={ this.toggleFollowing }
					showBack={ this.props.showBack }
				/>
			</Stream>
		);
	}
}

export default connect(
	( state ) => ( {
		followedTags: getReaderFollowedTags( state ),
		tags: getReaderTags( state ),
	} ),
	{
		followTag: requestFollowTag,
		unfollowTag: requestUnfollowTag,
	}
)( localize( TagStream ) );
