import { followReadTagMutation, unfollowReadTagMutation } from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { localize, translate as i18nTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect, useDispatch } from 'react-redux';
import titleCase from 'to-title-case';
import isReaderTagEmbedPage from 'calypso/lib/reader/is-reader-tag-embed-page';
import ReaderMain from 'calypso/reader/components/reader-main';
import { useFollowedTags, useTagBySlug } from 'calypso/reader/data/tags';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import Stream from 'calypso/reader/stream';
import ReaderTagSidebar from 'calypso/reader/stream/reader-tag-sidebar';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { registerLastActionRequiresLogin } from 'calypso/state/reader-ui/actions';
import EmptyContent from './empty';
import TagStreamHeader from './header';
import './style.scss';

// Matches emoji and keycap sequences (# / * / 0-9 + optional U+FE0F + U+20E3).
const EMOJI_TITLE_PATTERN =
	/\p{Emoji_Presentation}|\p{Extended_Pictographic}|[#*0-9]\uFE0F?\u20E3/u;

class TagStream extends Component {
	static propTypes = {
		encodedTagSlug: PropTypes.string,
		decodedTagSlug: PropTypes.string,
	};

	state = {
		emojiText: null,
	};

	_isMounted = false;

	componentDidMount() {
		this._isMounted = true;
		import( /* webpackChunkName: "async-load-emoji-text" */ 'emoji-text' ).then( ( emojiText ) => {
			if ( this._isMounted ) {
				this.setState( { emojiText: emojiText.default } );
			}
		} );
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	isSubscribed = () => {
		const tag = this.props.tags?.find( ( t ) => t.slug === this.props.encodedTagSlug );
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
		const tag = this.props.tags?.find( ( t ) => t.slug === this.props.encodedTagSlug );
		const titleText =
			tag?.title ||
			this.props.initialTitle ||
			titleCase( this.props.decodedTagSlug.replace( /-/g, ' ' ) );

		let encodedTagSlug = this.props.encodedTagSlug;

		// If the tag contains emoji, convert to text equivalent
		const isEmojiTitle =
			!! this.props.decodedTagSlug && EMOJI_TITLE_PATTERN.test( this.props.decodedTagSlug );
		if ( this.state.emojiText && isEmojiTitle ) {
			encodedTagSlug = this.state.emojiText.convert( this.props.decodedTagSlug, {
				delimiter: '',
			} );
		}

		if ( this.props.isNotFound ) {
			return (
				<ReaderMain className="tag-stream__main">
					<TagStreamHeader
						title={ titleText }
						encodedTagSlug={ encodedTagSlug }
						// Should not be necessary because the user shouldn't have been able to
						// subscribe to a missing tag, but still give them a route to unfollow
						// if that's somehow the case.
						showFollow={ this.isSubscribed() }
						showSort={ false }
					/>
					{ emptyContent() }
				</ReaderMain>
			);
		}

		// Put the tag stream header at the top of the body, so it can be even with the sidebar in the two column layout.
		const tagHeader = ( showSort = true ) => (
			<TagStreamHeader
				title={ titleText }
				description={ this.props.description }
				encodedTagSlug={ encodedTagSlug }
				showFollow={ !! ( tag && tag.id ) }
				following={ this.isSubscribed() }
				onFollowToggle={ this.toggleFollowing }
				showSort={ showSort }
				sort={ this.props.sort }
			/>
		);
		const sidebarProps = ! isReaderTagEmbedPage( window.location ) && {
			streamSidebar: () => <ReaderTagSidebar tag={ this.props.decodedTagSlug } />,
			sidebarTabTitle: this.props.translate( 'Related' ),
		};

		const emptyContentWithHeader = () => (
			<>
				{ tagHeader( false ) }
				{ emptyContent() }
			</>
		);

		return (
			<Stream
				{ ...this.props }
				className="tag-stream__main"
				listName={ titleText }
				emptyContent={ emptyContentWithHeader }
				showFollowInHeader
				forcePlaceholders={ ! tag } // if tag has not loaded yet, then make everything a placeholder
				streamHeader={ tagHeader }
				showSiteNameOnCards={ false }
				useCompactCards
				wideLayout
				{ ...sidebarProps }
			/>
		);
	}
}

function withReaderTags( Inner ) {
	return function WithReaderTags( props ) {
		const { data: followedTags } = useFollowedTags();
		const { data: currentTag, isNotFound } = useTagBySlug( props.decodedTagSlug );

		// Annotate the active tag with isFollowing so the existing isSubscribed()
		// check on the class works against the same shape as the followed list.
		const annotatedCurrent = currentTag
			? {
					...currentTag,
					isFollowing: followedTags?.some( ( t ) => t.slug === currentTag.slug ) ?? false,
			  }
			: null;

		const tags = [ annotatedCurrent, ...( followedTags ?? [] ) ].filter( Boolean );

		return (
			<Inner
				{ ...props }
				tags={ tags }
				followedTags={ followedTags }
				description={ currentTag?.description }
				isNotFound={ isNotFound }
			/>
		);
	};
}

function withTagFollowMutations( Inner ) {
	return function WithTagFollowMutations( props ) {
		const queryClient = useQueryClient();
		const dispatch = useDispatch();
		const { mutate: follow } = useMutation( followReadTagMutation( queryClient ) );
		const { mutate: unfollow } = useMutation( unfollowReadTagMutation( queryClient ) );

		const followTag = ( tag ) =>
			follow( tag, {
				onError: () =>
					dispatch(
						errorNotice( i18nTranslate( 'Could not follow tag: %(tag)s', { args: { tag } } ) )
					),
			} );
		const unfollowTag = ( tag ) =>
			unfollow( tag, {
				onError: () =>
					dispatch(
						errorNotice( i18nTranslate( 'Could not unfollow tag: %(tag)s', { args: { tag } } ) )
					),
			} );

		return <Inner { ...props } followTag={ followTag } unfollowTag={ unfollowTag } />;
	};
}

export default connect(
	( state, { sort } ) => ( {
		isLoggedIn: isUserLoggedIn( state ),
		sort,
	} ),
	{
		recordReaderTracksEvent,
		registerLastActionRequiresLogin,
	}
)( withReaderTags( withTagFollowMutations( localize( TagStream ) ) ) );
