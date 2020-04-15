/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { noop, truncate, get } from 'lodash';
import classnames from 'classnames';
import ReactDom from 'react-dom';
import closest from 'component-closest';

/**
 * Internal Dependencies
 */
import { Card } from '@automattic/components';
import DisplayTypes from 'state/reader/posts/display-types';
import * as stats from 'reader/stats';
import ReaderPostActions from 'blocks/reader-post-actions';
import PostByline from './byline';
import GalleryPost from './gallery';
import PhotoPost from './photo';
import StandardPost from './standard';
import ConversationPost from './conversation-post';
import FollowButton from 'reader/follow-button';
import DailyPostButton from 'blocks/daily-post-button';
import { isDailyPostChallengeOrPrompt } from 'blocks/daily-post-button/helper';
import {
	getDiscoverBlogName,
	getSourceFollowUrl as getDiscoverFollowUrl,
} from 'reader/discover/helper';
import DiscoverFollowButton from 'reader/discover/follow-button';
import { expandCard as expandCardAction } from 'state/ui/reader/card-expansions/actions';
import isReaderCardExpanded from 'state/selectors/is-reader-card-expanded';

/**
 * Style dependencies
 */
import './style.scss';

class ReaderPostCard extends React.Component {
	static propTypes = {
		post: PropTypes.object.isRequired,
		site: PropTypes.object,
		feed: PropTypes.object,
		isSelected: PropTypes.bool,
		onClick: PropTypes.func,
		onCommentClick: PropTypes.func,
		showPrimaryFollowButton: PropTypes.bool,
		discoverPost: PropTypes.object,
		discoverSite: PropTypes.object,
		showSiteName: PropTypes.bool,
		followSource: PropTypes.string,
		isDiscoverStream: PropTypes.bool,
		postKey: PropTypes.object,
		compact: PropTypes.bool,
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
		const rootNode = ReactDom.findDOMNode( this ),
			selection = window.getSelection && window.getSelection();

		// if the click has modifier or was not primary, ignore it
		if ( event.button > 0 || event.metaKey || event.controlKey || event.shiftKey || event.altKey ) {
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
			post,
			discoverPost,
			discoverSite,
			site,
			feed,
			onCommentClick,
			showPrimaryFollowButton,
			isSelected,
			showSiteName,
			followSource,
			isDiscoverStream,
			postKey,
			isExpanded,
			expandCard,
			compact,
		} = this.props;

		const isPhotoPost = !! ( post.display_type & DisplayTypes.PHOTO_ONLY ) && ! compact;
		const isGalleryPost = !! ( post.display_type & DisplayTypes.GALLERY ) && ! compact;
		const isVideo = !! ( post.display_type & DisplayTypes.FEATURED_VIDEO ) && ! compact;
		const isDiscover = post.is_discover;
		const title = truncate( post.title, { length: 140, separator: /,? +/ } );
		const classes = classnames( 'reader-post-card', {
			'has-thumbnail': !! post.canonical_media,
			'is-photo': isPhotoPost,
			'is-gallery': isGalleryPost,
			'is-selected': isSelected,
			'is-discover': isDiscover,
			'is-expanded-video': isVideo && isExpanded,
			'is-compact': compact,
		} );

		let discoverFollowButton;

		if ( isDiscover && ! compact ) {
			const discoverBlogName = getDiscoverBlogName( post ) || null;
			discoverFollowButton = discoverBlogName && (
				<DiscoverFollowButton
					siteName={ discoverBlogName }
					followUrl={ getDiscoverFollowUrl( post ) }
				/>
			);
		}

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		const readerPostActions = (
			<ReaderPostActions
				post={ discoverPost || post }
				site={ site }
				visitUrl={ post.URL }
				showVisit={ true }
				showMenu={ true }
				fullPost={ false }
				showMenuFollow={ ! isDiscover }
				onCommentClick={ onCommentClick }
				showEdit={ false }
				className="ignore-click"
				iconSize={ 18 }
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
				<PostByline post={ postForByline } site={ discoverSite } showSiteName={ true } />
			);
		} else {
			postByline = (
				<PostByline
					post={ post }
					site={ site }
					feed={ feed }
					showSiteName={ showSiteName || isDiscover }
					showAvatar={ ! compact }
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
					{ discoverFollowButton }
					{ readerPostActions }
				</PhotoPost>
			);
		} else if ( isGalleryPost ) {
			readerPostCard = (
				<GalleryPost post={ post } title={ title } isDiscover={ isDiscover }>
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
					{ discoverFollowButton }
					{ readerPostActions }
				</StandardPost>
			);
		}

		const followUrl = feed ? feed.feed_URL : post.site_URL;
		const onClick = ! isPhotoPost && ! compact ? this.handleCardClick : noop;
		return (
			<Card className={ classes } onClick={ onClick }>
				{ ! compact && postByline }
				{ showPrimaryFollowButton && followUrl && (
					<FollowButton
						siteUrl={ followUrl }
						followSource={ followSource }
						railcar={ post.railcar }
					/>
				) }
				{ readerPostCard }
				{ this.props.children }
			</Card>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		isExpanded: isReaderCardExpanded( state, ownProps.postKey ),
	} ),
	{ expandCard: expandCardAction }
)( ReaderPostCard );
