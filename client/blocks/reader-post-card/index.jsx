import { Card } from '@automattic/components';
import classnames from 'classnames';
import closest from 'component-closest';
import { truncate, get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import DailyPostButton from 'calypso/blocks/daily-post-button';
import { isDailyPostChallengeOrPrompt } from 'calypso/blocks/daily-post-button/helper';
import ReaderPostActions from 'calypso/blocks/reader-post-actions';
import TagPost from 'calypso/blocks/reader-post-card/tag-post';
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
		discoverPost: PropTypes.object,
		discoverSite: PropTypes.object,
		showSiteName: PropTypes.bool,
		followSource: PropTypes.string,
		isDiscoverStream: PropTypes.bool,
		postKey: PropTypes.object,
		compact: PropTypes.bool,
		isWPForTeamsItem: PropTypes.bool,
		teams: PropTypes.array,
		hasOrganization: PropTypes.bool,
	};

	static defaultProps = {
		onClick: noop,
		onCommentClick: noop,
		isSelected: false,
		showSiteName: true,
	};

	propagateCardClick = () => {
		// If we have an discover pick post available, send the discover pick to the full post view
		const postToOpen = get( this.props, 'discoverPost' ) || this.props.post;
		this.props.onClick( postToOpen );
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
			discoverPost,
			discoverSite,
			site,
			feed,
			onCommentClick,
			isSelected,
			showSiteName,
			followSource,
			isDiscoverStream,
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
		const isDiscover = post.is_discover;
		const title = truncate( post.title, { length: 140, separator: /,? +/ } );
		const isReaderTagPage = currentRoute.startsWith( '/tag/' );
		const isReaderSearchPage = currentRoute.startsWith( '/read/search' );
		const classes = classnames( 'reader-post-card', {
			'has-thumbnail': !! post.canonical_media,
			'is-photo': isPhotoPost,
			'is-gallery': isGalleryPost,
			'is-selected': isSelected,
			'is-discover': isDiscover,
			'is-seen': isSeen,
			'is-expanded-video': isVideo && isExpanded,
			'is-compact': compact,
			'is-tag-post': isReaderTagPage,
		} );

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		const readerPostActions = (
			<ReaderPostActions
				post={ discoverPost || post }
				site={ site }
				visitUrl={ post.URL }
				showVisit={ true }
				fullPost={ false }
				onCommentClick={ onCommentClick }
				showEdit={ false }
				showViews={ !! post.views }
				showSuggestedFollows={ isReaderSearchPage }
				className="ignore-click"
				iconSize={ 20 }
			/>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */

		// Set up post byline
		let postByline;

		if ( isDiscoverStream && discoverPost && discoverSite ) {
			// create a post like object with some props from the discover post
			const postForByline = Object.assign( {}, discoverPost || {}, {
				date: post.date,
				URL: post.URL,
				primary_tag: post.primary_tag,
			} );
			postByline = (
				<PostByline
					post={ postForByline }
					site={ discoverSite }
					showSiteName={ true }
					teams={ teams }
					showFollow={ ! isDiscover }
					followSource={ followSource }
				/>
			);
		} else {
			postByline = (
				<PostByline
					post={ post }
					site={ site }
					feed={ feed }
					showSiteName={ showSiteName || isDiscover }
					showAvatar={ ! compact }
					teams={ teams }
					showFollow={ ! isDiscover }
					followSource={ followSource }
				/>
			);
		}

		// Set up post card
		let readerPostCard;
		if ( compact ) {
			readerPostCard = (
				<ConversationPost
					post={ post }
					title={ title }
					isDiscover={ isDiscover }
					postByline={ postByline }
					commentIds={ postKey.comments }
					onClick={ this.handleCardClick }
				/>
			);
		} else if ( isReaderTagPage ) {
			readerPostCard = (
				<TagPost
					post={ post }
					title={ title }
					isDiscover={ isDiscover }
					isExpanded={ isExpanded }
					expandCard={ expandCard }
					site={ site }
					postKey={ postKey }
					teams={ teams }
				></TagPost>
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
				<GalleryPost
					post={ post }
					title={ title }
					onClick={ this.handleCardClick }
					isDiscover={ isDiscover }
				>
					{ readerPostActions }
				</GalleryPost>
			);
		} else {
			readerPostCard = (
				<StandardPost
					post={ post }
					title={ title }
					isDiscover={ isDiscover }
					isExpanded={ isExpanded }
					expandCard={ expandCard }
					site={ site }
					postKey={ postKey }
				>
					{ isDailyPostChallengeOrPrompt( post ) && site && (
						<DailyPostButton post={ post } site={ site } />
					) }
					{ readerPostActions }
				</StandardPost>
			);
		}

		const onClick = ! isPhotoPost && ! compact ? this.handleCardClick : noop;
		return (
			<Card className={ classes } onClick={ onClick } tagName="article">
				{ ! compact && ! isReaderTagPage && postByline }
				{ readerPostCard }
				{ this.props.children }
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
		hasOrganization: hasReaderFollowOrganization(
			state,
			ownProps.postKey.feedId,
			ownProps.postKey.blogId
		),
		isExpanded: isReaderCardExpanded( state, ownProps.postKey ),
		teams: getReaderTeams( state ),
	} ),
	{ expandCard: expandCardAction }
)( ReaderPostCard );
