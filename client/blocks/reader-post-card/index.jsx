import { Card } from '@automattic/components';
import { truncate } from '@automattic/js-utils';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import ReaderPostActions from 'calypso/blocks/reader-post-actions';
import CompactPostCard from 'calypso/blocks/reader-post-card/compact';
import ReaderSuggestedFollowsDialog from 'calypso/blocks/reader-suggested-follows/dialog';
import { withReaderTeams } from 'calypso/components/data/with-reader-teams';
import { useFeedQuery } from 'calypso/reader/data/feed';
import DisplayTypes from 'calypso/reader/data/post/display-types';
import { useIsSeenVisible } from 'calypso/reader/data/seen-posts';
import * as stats from 'calypso/reader/stats';
import { expandCard as expandCardAction } from 'calypso/state/reader-ui/card-expansions/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isReaderCardExpanded from 'calypso/state/selectors/is-reader-card-expanded';
import PostByline from './byline';
import ConversationPost from './conversation-post';
import { getFreshlyPressedOn } from './freshly-pressed-badge';
import GalleryPost from './gallery';
import PostPhoto from './photo';
import PostCardComments from './post-card-comments';
import StandardPost from './standard';
import './style.scss';

const noop = () => {};

class ReaderPostCard extends Component {
	static propTypes = {
		currentRoute: PropTypes.string,
		post: PropTypes.object.isRequired,
		site: PropTypes.object,
		feed: PropTypes.object,
		isSelected: PropTypes.bool,
		onClick: PropTypes.func,
		onCommentClick: PropTypes.func,
		handleClick: PropTypes.func,
		showSiteName: PropTypes.bool,
		postKey: PropTypes.object,
		compact: PropTypes.bool,
		teams: PropTypes.array,
		isSeenVisible: PropTypes.bool,
		fixedHeaderHeight: PropTypes.number,
		streamKey: PropTypes.string,
		commentsApiDisabled: PropTypes.bool,
		showBylineSecondarySiteLink: PropTypes.bool,
	};

	static defaultProps = {
		onClick: noop,
		onCommentClick: noop,
		handleClick: noop,
		isSelected: false,
		showSiteName: true,
		showBylineSecondarySiteLink: true,
	};

	state = {
		isSuggestedFollowsModalOpen: false,
	};

	openSuggestedFollowsModal = () => {
		this.setState( { isSuggestedFollowsModalOpen: true } );
	};

	onCloseSuggestedFollowModal = () => {
		this.setState( { isSuggestedFollowsModalOpen: false } );
	};

	propagateCardClick = () => {
		this.props.onClick( this.props.post );
	};

	handleCardClick = ( event ) => {
		const selection = window.getSelection && window.getSelection();

		// if the click has modifier or was not primary, ignore it
		if ( event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) {
			if ( event.target.closest( '.reader-post-card__title-link' ) ) {
				stats.recordPermalinkClick( 'card_title_with_modifier', this.props.post );
			}
			return;
		}

		if ( event.target.closest( '.should-scroll' ) ) {
			setTimeout( function () {
				window.scrollTo( 0, 0 );
			}, 100 );
		}

		// declarative ignore
		if ( event.target.closest( '.ignore-click, [rel~=external]' ) ) {
			return;
		}

		// ignore clicks on comments
		if ( event.target.closest( '.conversations__comment-list' ) ) {
			return;
		}

		// ignore clicks on inline comments
		if ( event.target.closest( '.comments__comment-list' ) ) {
			return;
		}

		// ignore clicks on anchors inside inline content
		if ( event.target.closest( 'a' ) && event.target.closest( '.reader-excerpt' ) ) {
			return;
		}

		// ignore clicks to close a dialog backdrop
		if ( event.target.closest( '.dialog__backdrop' ) ) {
			return;
		}

		// ignore clicks when highlighting text
		if ( selection && selection.toString() ) {
			return;
		}

		// programattic ignore
		if ( ! event.defaultPrevented ) {
			// some child handled it
			event.preventDefault();
			this.propagateCardClick();
		}
	};

	render() {
		const {
			currentRoute,
			post,
			site,
			feed,
			onCommentClick,
			isSelected,
			showSiteName,
			postKey,
			isExpanded,
			expandCard,
			compact,
			teams,
		} = this.props;

		const isPostPhoto = !! ( post.display_type & DisplayTypes.PHOTO_ONLY ) && ! compact;
		const isGalleryPost = !! ( post.display_type & DisplayTypes.GALLERY ) && ! compact;
		const isVideo = !! ( post.display_type & DisplayTypes.FEATURED_VIDEO ) && ! compact;
		const title = truncate( post.title, { length: 140, separator: /,? +/ } );
		const isConversations = currentRoute.startsWith( '/reader/conversations' );
		const isDiscoverPage = currentRoute.startsWith( '/discover' );

		const shouldShowPostCardComments = ! isConversations;
		const showSuggestedFollows = isDiscoverPage;
		const freshlyPressedOn = getFreshlyPressedOn( this.props.streamKey, post );

		const classes = clsx( 'reader-post-card', {
			'has-thumbnail': !! post.canonical_media,
			'is-photo': isPostPhoto,
			'is-gallery': isGalleryPost,
			'is-selected': isSelected,
			'is-seen': this.props.isSeenVisible,
			'is-expanded-video': isVideo && isExpanded,
			'is-compact': compact,
		} );

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		const readerPostActions = (
			<ReaderPostActions
				post={ post }
				site={ site }
				visitUrl={ post.URL }
				fullPost={ false }
				onCommentClick={ onCommentClick }
				className="ignore-click"
				iconSize={ 20 }
				commentsApiDisabled={ this.props.commentsApiDisabled }
			/>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */

		// Set up post byline
		const postByline = (
			<PostByline
				post={ post }
				site={ site }
				feed={ feed }
				showSiteName={ showSiteName }
				showAvatar={ ! compact }
				teams={ teams }
				showFollow
				openSuggestedFollows={ this.openSuggestedFollowsModal }
				compact={ compact }
				showBylineSecondarySiteLink={ this.props.showBylineSecondarySiteLink }
			/>
		);

		// Set up post card
		let readerPostCard;
		if ( isConversations ) {
			readerPostCard = (
				<ConversationPost
					post={ post }
					title={ title }
					postByline={ postByline }
					commentIds={ postKey?.comments ?? [] }
					onClick={ this.handleCardClick }
				/>
			);
		} else if ( compact ) {
			readerPostCard = (
				<CompactPostCard
					post={ post }
					title={ title }
					isExpanded={ isExpanded }
					expandCard={ expandCard }
					site={ site }
					postKey={ postKey }
					postByline={ postByline }
					freshlyPressedOn={ freshlyPressedOn }
					onClick={ this.handleCardClick }
					openSuggestedFollows={ this.openSuggestedFollowsModal }
				>
					{ readerPostActions }
				</CompactPostCard>
			);
		} else if ( isPostPhoto ) {
			readerPostCard = (
				<PostPhoto
					post={ post }
					site={ site }
					title={ title }
					onClick={ this.handleCardClick }
					isExpanded={ isExpanded }
					expandCard={ expandCard }
					postKey={ postKey }
				>
					{ readerPostActions }
				</PostPhoto>
			);
		} else if ( isGalleryPost ) {
			readerPostCard = (
				<GalleryPost post={ post } title={ title } onClick={ this.handleCardClick }>
					{ readerPostActions }
				</GalleryPost>
			);
		} else {
			readerPostCard = (
				<StandardPost
					post={ post }
					title={ title }
					isExpanded={ isExpanded }
					expandCard={ expandCard }
					site={ site }
					postKey={ postKey }
				>
					{ readerPostActions }
				</StandardPost>
			);
		}

		const onClick = ! isPostPhoto ? this.handleCardClick : noop;
		return (
			<Card ref={ this.props.itemRef } className={ classes } onClick={ onClick } tagName="article">
				{ ! compact && postByline }
				{ readerPostCard }
				{ this.props.children }
				{ showSuggestedFollows && post.site_ID && (
					<ReaderSuggestedFollowsDialog
						onClose={ this.onCloseSuggestedFollowModal }
						siteId={ +post.site_ID }
						postId={ +post.ID }
						isVisible={ this.state.isSuggestedFollowsModalOpen }
						author={ feed?.blog_owner }
					/>
				) }
				{ shouldShowPostCardComments && (
					<PostCardComments
						post={ post }
						handleClick={ this.props.handleClick }
						fixedHeaderHeight={ this.props.fixedHeaderHeight }
						streamKey={ this.props.streamKey }
					/>
				) }
			</Card>
		);
	}
}

const ConnectedReaderPostCard = compose(
	withReaderTeams,
	connect(
		( state, ownProps ) => ( {
			currentRoute: getCurrentRoute( state ),
			isExpanded: isReaderCardExpanded( state, ownProps.postKey ),
		} ),
		{ expandCard: expandCardAction }
	)
)( ReaderPostCard );

export default function ReaderPostCardContainer( props ) {
	const feedId = props.postKey?.feedId ?? props.post?.feed_ID;
	const { data: fetchedFeed } = useFeedQuery( feedId );
	const feed = props.feed ?? fetchedFeed;
	const blogId = props.postKey?.blogId ?? props.post?.site_ID ?? feed?.blog_ID;
	const isSeenVisible = useIsSeenVisible( { feedId, blogId, post: props.post } );

	return <ConnectedReaderPostCard { ...props } feed={ feed } isSeenVisible={ isSeenVisible } />;
}
