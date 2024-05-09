import { localize } from 'i18n-calypso';
import { find } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import titleCase from 'to-title-case';
import QueryReaderFollowedTags from 'calypso/components/data/query-reader-followed-tags';
import QueryReaderTag from 'calypso/components/data/query-reader-tag';
import isReaderTagEmbedPage from 'calypso/lib/reader/is-reader-tag-embed-page';
import ReaderMain from 'calypso/reader/components/reader-main';
import HeaderBack from 'calypso/reader/header-back';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import Stream from 'calypso/reader/stream';
import ReaderTagSidebar from 'calypso/reader/stream/reader-tag-sidebar';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { requestFollowTag, requestUnfollowTag } from 'calypso/state/reader/tags/items/actions';
import { getReaderTags, getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';
import getReaderTagBySlug from 'calypso/state/reader/tags/selectors/get-reader-tag-by-slug';
import { registerLastActionRequiresLogin } from 'calypso/state/reader-ui/actions';
import EmptyContent from './empty';
import TagStreamHeader from './header';
import './style.scss';

class TagStream extends Component {
	static propTypes = {
		encodedTagSlug: PropTypes.string,
		decodedTagSlug: PropTypes.string,
	};

	state = {
		isEmojiTitle: false,
	};

	_isMounted = false;

	componentDidMount() {
		this._isMounted = true;
		asyncRequire( 'emoji-text' ).then( ( emojiText ) => {
			if ( this._isMounted ) {
				this.setState( { emojiText: emojiText.default } );
			}
		} );
		asyncRequire( 'twemoji' ).then( ( twemoji ) => {
			if ( this._isMounted ) {
				const title = this.props.decodedTagSlug;
				this.setState( {
					twemoji: twemoji.default,
					isEmojiTitle: title && twemoji.default.test( title ),
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

		if ( ! this.props.isLoggedIn ) {
			return this.props.registerLastActionRequiresLogin( {
				type: 'follow-tag',
				tag: decodedTagSlug,
			} );
		}

		toggleAction( decodedTagSlug );
		recordAction( isFollowing ? 'unfollowed_topic' : 'followed_topic' );
		recordGaEvent(
			isFollowing ? 'Clicked Unfollow Topic' : 'Clicked Follow Topic',
			decodedTagSlug
		);
		this.props.recordReaderTracksEvent(
			isFollowing ? 'calypso_reader_reader_tag_unfollowed' : 'calypso_reader_reader_tag_followed',
			{
				tag: decodedTagSlug,
			}
		);
	};

	render() {
		const emptyContent = () => <EmptyContent decodedTagSlug={ this.props.decodedTagSlug } />;
		const title = this.props.decodedTagSlug;
		const tag = find( this.props.tags, { slug: this.props.encodedTagSlug } );
		const titleText = titleCase( title.replace( /-/g, ' ' ) );

		let imageSearchString = this.props.encodedTagSlug;

		// If the tag contains emoji, convert to text equivalent
		if ( this.state.emojiText && this.state.isEmojiTitle ) {
			imageSearchString = this.state.emojiText.convert( title, {
				delimiter: '',
			} );
		}

		if ( tag && tag.error ) {
			return (
				<ReaderMain className="tag-stream__main">
					<QueryReaderFollowedTags />
					<QueryReaderTag tag={ this.props.decodedTagSlug } />
					{ this.props.showBack && <HeaderBack /> }
					<TagStreamHeader
						title={ title }
						imageSearchString={ imageSearchString }
						showFollow={ false }
						showSort={ false }
						showBack={ this.props.showBack }
					/>
					{ emptyContent() }
				</ReaderMain>
			);
		}

		// Put the tag stream header at the top of the body, so it can be even with the sidebar in the two column layout.
		const tagHeader = () => (
			<TagStreamHeader
				title={ titleText }
				description={ this.props.description }
				imageSearchString={ imageSearchString }
				showFollow={ !! ( tag && tag.id ) }
				following={ this.isSubscribed() }
				onFollowToggle={ this.toggleFollowing }
				showBack={ this.props.showBack }
				showSort
				sort={ this.props.sort }
				recordReaderTracksEvent={ this.props.recordReaderTracksEvent }
			/>
		);
		const sidebarProps = ! isReaderTagEmbedPage( window.location ) && {
			streamSidebar: () => (
				<ReaderTagSidebar tag={ this.props.decodedTagSlug } showFollow={ false } />
			),
			sidebarTabTitle: this.props.translate( 'Related' ),
		};

		return (
			<Stream
				{ ...this.props }
				className="tag-stream__main"
				listName={ title }
				emptyContent={ emptyContent }
				showFollowInHeader
				forcePlaceholders={ ! tag } // if tag has not loaded yet, then make everything a placeholder
				streamHeader={ tagHeader }
				showSiteNameOnCards={ false }
				useCompactCards
				{ ...sidebarProps }
			>
				<QueryReaderFollowedTags />
				<QueryReaderTag tag={ this.props.decodedTagSlug } />
				{ this.props.showBack && <HeaderBack /> }
			</Stream>
		);
	}
}

export default connect(
	( state, { decodedTagSlug, sort } ) => {
		const tag = getReaderTagBySlug( state, decodedTagSlug );
		return {
			description: tag?.description,
			followedTags: getReaderFollowedTags( state ),
			tags: getReaderTags( state ),
			isLoggedIn: isUserLoggedIn( state ),
			sort,
		};
	},
	{
		followTag: requestFollowTag,
		recordReaderTracksEvent,
		unfollowTag: requestUnfollowTag,
		registerLastActionRequiresLogin,
	}
)( localize( TagStream ) );
