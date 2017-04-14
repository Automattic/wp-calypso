/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { noop, truncate, get, isEmpty } from 'lodash';
import classnames from 'classnames';
import ReactDom from 'react-dom';
import closest from 'component-closest';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import DisplayTypes from 'state/reader/posts/display-types';
import * as stats from 'reader/stats';
import ReaderPostActions from 'blocks/reader-post-actions';
import PostByline from './byline';
import GalleryPost from './gallery';
import PhotoPost from './photo';
import StandardPost from './standard';
import FollowButton from 'reader/follow-button';
import DailyPostButton from 'blocks/daily-post-button';
import { isDailyPostChallengeOrPrompt } from 'blocks/daily-post-button/helper';
import { getDiscoverBlogName,
	getSourceFollowUrl as getDiscoverFollowUrl,
} from 'reader/discover/helper';
import DiscoverFollowButton from 'reader/discover/follow-button';
import { expandCard as expandCardAction } from 'state/ui/reader/card-expansions/actions';
import { isReaderCardExpanded } from 'state/selectors';

class ReaderPostCard extends React.Component {
	static propTypes = {
		post: PropTypes.object.isRequired,
		site: PropTypes.object,
		feed: PropTypes.object,
		isSelected: PropTypes.bool,
		onClick: PropTypes.func,
		onCommentClick: PropTypes.func,
		showPrimaryFollowButton: PropTypes.bool,
		discoverPick: PropTypes.shape( {
			post: PropTypes.object,
			site: PropTypes.object,
		} ),
		showSiteName: PropTypes.bool,
		followSource: PropTypes.string,
		isDiscoverStream: PropTypes.bool,
		postKey: PropTypes.object,
	};

	static defaultProps = {
		onClick: noop,
		onCommentClick: noop,
		isSelected: false,
		showSiteName: true,
	};

	propagateCardClick = () => {
		// If we have an discover pick post available, send the discover pick to the full post view
		const postToOpen = get( this.props, 'discoverPick.post' ) || this.props.post;
		this.props.onClick( postToOpen );
	}

	handleCardClick = ( event ) => {
		const rootNode = ReactDom.findDOMNode( this ),
			selection = window.getSelection && window.getSelection();

		// if the click has modifier or was not primary, ignore it
		if ( event.button > 0 || event.metaKey || event.controlKey || event.shiftKey || event.altKey ) {
			if ( closest( event.target, '.reader-post-card__title-link', true, rootNode ) ) {
				stats.recordPermalinkClick( 'card_title_with_modifier', this.props.post );
			}
			return;
		}

		if ( closest( event.target, '.should-scroll', true, rootNode ) ) {
			setTimeout( function() {
				window.scrollTo( 0, 0 );
			}, 100 );
		}

		// declarative ignore
		if ( closest( event.target, '.ignore-click, [rel~=external]', true, rootNode ) ) {
			return;
		}

		// ignore clicks on anchors inside inline content
		if ( closest( event.target, 'a', true, rootNode ) && closest( event.target, '.reader-excerpt', true, rootNode ) ) {
			return;
		}

		// ignore clicks when highlighting text
		if ( selection && selection.toString() ) {
			return;
		}

		// programattic ignore
		if ( ! event.defaultPrevented ) { // some child handled it
			event.preventDefault();
			this.propagateCardClick();
		}
	}

	render() {
		const {
			post,
			discoverPick,
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
		} = this.props;

		const isPhotoPost = !! ( post.display_type & DisplayTypes.PHOTO_ONLY );
		const isGalleryPost = !! ( post.display_type & DisplayTypes.GALLERY );
		const isVideo = !! ( post.display_type & DisplayTypes.FEATURED_VIDEO );
		const isDiscover = post.is_discover;
		const title = truncate( post.title, { length: 140, separator: /,? +/ } );
		const classes = classnames( 'reader-post-card', {
			'has-thumbnail': !! post.canonical_media,
			'is-photo': isPhotoPost,
			'is-gallery': isGalleryPost,
			'is-selected': isSelected,
			'is-discover': isDiscover,
			'is-expanded-video': isVideo && isExpanded,
		} );

		let discoverFollowButton;

		if ( isDiscover ) {
			const discoverBlogName = getDiscoverBlogName( post ) || null;
			discoverFollowButton = discoverBlogName &&
				<DiscoverFollowButton siteName={ discoverBlogName } followUrl={ getDiscoverFollowUrl( post ) } />;
		}

		const readerPostActions = <ReaderPostActions
			post={ get( discoverPick, 'post' ) || post }
			site={ site }
			visitUrl = { post.URL }
			showVisit={ true }
			showMenu={ true }
			fullPost= { false }
			showMenuFollow={ ! isDiscover }
			onCommentClick={ onCommentClick }
			showEdit={ false }
			className="ignore-click"
			iconSize={ 18 } />;

		let readerPostCard;
		if ( isPhotoPost ) {
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
			readerPostCard = <GalleryPost post={ post } title={ title } isDiscover={ isDiscover }>
					{ readerPostActions }
				</GalleryPost>;
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
					{ isDailyPostChallengeOrPrompt( post ) && site && <DailyPostButton post={ post } site={ site } tagName="span" /> }
					{ discoverFollowButton }
					{ readerPostActions }
				</StandardPost>
			);
		}

		// set up post byline
		let postByline;

		if ( isDiscoverStream && ! isEmpty( discoverPick ) ) {
			// create a post like object with some props from the discover post
			const postForByline = Object.assign( {},
				discoverPick.post || {},
				{
					date: post.date,
					URL: post.URL,
					primary_tag: post.primary_tag,
				} );
			postByline = <PostByline post={ postForByline } site={ discoverPick.site } showSiteName={ true } />;
		} else {
			postByline = <PostByline post={ post } site={ site } feed={ feed } showSiteName={ showSiteName || isDiscover } />;
		}

		const followUrl = feed ? feed.feed_URL : post.site_URL;

		return (
			<Card className={ classes } onClick={ ! isPhotoPost && this.handleCardClick }>
				{ postByline }
				{ showPrimaryFollowButton && followUrl && <FollowButton siteUrl={ followUrl } followSource={ followSource } /> }
				{ readerPostCard }
				{ this.props.children }
			</Card>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		isExpanded: isReaderCardExpanded( state, ownProps.postKey )
	} ),
	{ expandCard: expandCardAction }
)( ReaderPostCard );
