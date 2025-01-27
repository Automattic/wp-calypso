import { Card } from '@automattic/components';
import { localeRegexString } from '@automattic/i18n-utils';
import clsx from 'clsx';
import closest from 'component-closest';
import { truncate } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import ReaderPostActions from 'calypso/blocks/reader-post-actions';
import CompactPostCard from 'calypso/blocks/reader-post-card/compact';
import ReaderSuggestedFollowsDialog from 'calypso/blocks/reader-suggested-follows/dialog';
import { isEligibleForUnseen } from 'calypso/reader/get-helpers';
import * as stats from 'calypso/reader/stats';
import { hasReaderFollowOrganization } from 'calypso/state/reader/follows/selectors';
import DisplayTypes from 'calypso/state/reader/posts/display-types';
import { expandCard as expandCardAction } from 'calypso/state/reader-ui/card-expansions/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isFeedWPForTeams from 'calypso/state/selectors/is-feed-wpforteams';
import isReaderCardExpanded from 'calypso/state/selectors/is-reader-card-expanded';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getReaderTeams } from 'calypso/state/teams/selectors';
import PostByline from './byline';
import ConversationPost from './conversation-post';
import GalleryPost from './gallery';
import PhotoPost from './photo';
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
		isWPForTeamsItem: PropTypes.bool,
		teams: PropTypes.array,
		hasOrganization: PropTypes.bool,
		fixedHeaderHeight: PropTypes.number,
		streamKey: PropTypes.string,
	};

	static defaultProps = {
		onClick: noop,
		onCommentClick: noop,
		handleClick: noop,
		isSelected: false,
		showSiteName: true,
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
		const rootNode = ReactDom.findDOMNode( this );
		const selection = window.getSelection && window.getSelection();

		// if the click has modifier or was not primary, ignore it
		if ( event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) {
			if ( closest( event.target, '.reader-post-card__title-link', rootNode ) ) {
				stats.recordPermalinkClick( 'card_title_with_modifier', this.props.post );
			}
			return;
		}

		if ( closest( event.target, '.should-scroll', rootNode ) ) {
			setTimeout( function () {
				window.scrollTo( 0, 0 );
			}, 100 );
		}

		// declarative ignore
		if ( closest( event.target, '.ignore-click, [rel~=external]', rootNode ) ) {
			return;
		}

		// ignore clicks on comments
		if ( closest( event.target, '.conversations__comment-list', rootNode ) ) {
			return;
		}

		// ignore clicks on inline comments
		if ( closest( event.target, '.comments__comment-list', rootNode ) ) {
			return;
		}

		// ignore clicks on anchors inside inline content
		if (
			closest( event.target, 'a', rootNode ) &&
			closest( event.target, '.reader-excerpt', rootNode )
		) {
			return;
		}

		// ignore clicks to close a dialog backdrop
		if ( closest( event.target, '.dialog__backdrop', rootNode ) ) {
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
			hasOrganization,
			isWPForTeamsItem,
			teams,
		} = this.props;

		let isSeen = false;
		if ( isEligibleForUnseen( { isWPForTeamsItem, currentRoute, hasOrganization } ) ) {
			isSeen = post?.is_seen;
		}
		const isPhotoPost = !! ( post.display_type & DisplayTypes.PHOTO_ONLY ) && ! compact;
		const isGalleryPost = !! ( post.display_type & DisplayTypes.GALLERY ) && ! compact;
		const isVideo = !! ( post.display_type & DisplayTypes.FEATURED_VIDEO ) && ! compact;
		const title = truncate( post.title, { length: 140, separator: /,? +/ } );
		const isConversations = currentRoute.startsWith( '/read/conversations' );

		const isReaderSearchPage = new RegExp( `^(/${ localeRegexString })?/read/search` ).test(
			currentRoute
		);

		const shouldShowPostCardComments = ! isConversations;

		const classes = clsx( 'reader-post-card', {
			'has-thumbnail': !! post.canonical_media,
			'is-photo': isPhotoPost,
			'is-gallery': isGalleryPost,
			'is-selected': isSelected,
			'is-seen': isSeen,
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
					onClick={ this.handleCardClick }
					openSuggestedFollows={ this.openSuggestedFollowsModal }
				>
					{ readerPostActions }
				</CompactPostCard>
			);
		} else if ( isPhotoPost ) {
			readerPostCard = (
				<PhotoPost
					post={ post }
					site={ site }
					title={ title }
					onClick={ this.handleCardClick }
					isExpanded={ isExpanded }
					expandCard={ expandCard }
					postKey={ postKey }
				>
					{ readerPostActions }
				</PhotoPost>
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

		const showSuggestedFollows = isReaderSearchPage;
		const onClick = ! isPhotoPost ? this.handleCardClick : noop;
		return (
			<Card className={ classes } onClick={ onClick } tagName="article">
				{ ! compact && postByline }
				{ readerPostCard }
				{ this.props.children }
				{ showSuggestedFollows && post.site_ID && (
					<ReaderSuggestedFollowsDialog
						onClose={ this.onCloseSuggestedFollowModal }
						siteId={ +post.site_ID }
						postId={ +post.ID }
						isVisible={ this.state.isSuggestedFollowsModalOpen }
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

export default connect(
	( state, ownProps ) => ( {
		currentRoute: getCurrentRoute( state ),
		isWPForTeamsItem:
			ownProps.postKey &&
			( isSiteWPForTeams( state, ownProps.postKey.blogId ) ||
				isFeedWPForTeams( state, ownProps.postKey.feedId ) ),
		hasOrganization:
			ownProps.postKey &&
			hasReaderFollowOrganization( state, ownProps.postKey.feedId, ownProps.postKey.blogId ),
		isExpanded: isReaderCardExpanded( state, ownProps.postKey ),
		teams: getReaderTeams( state ),
	} ),
	{ expandCard: expandCardAction }
)( ReaderPostCard );
