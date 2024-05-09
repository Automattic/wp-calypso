import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { get, size, filter, isEmpty, includes } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import PostBlocked from 'calypso/blocks/reader-post-card/blocked';
import ReaderPostOptionsMenu from 'calypso/blocks/reader-post-options-menu';
import ReaderSiteStreamLink from 'calypso/blocks/reader-site-stream-link';
import QueryReaderFeed from 'calypso/components/data/query-reader-feed';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import FollowButton from 'calypso/reader/follow-button';
import { getSiteName } from 'calypso/reader/get-helpers';
import { keysAreEqual, keyForPost } from 'calypso/reader/post-key';
import { getStreamUrl } from 'calypso/reader/route';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { hasReaderFollowOrganization } from 'calypso/state/reader/follows/selectors';
import { getPostsByKeys } from 'calypso/state/reader/posts/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isFeedWPForTeams from 'calypso/state/selectors/is-feed-wpforteams';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import ReaderCombinedCardPost from './post';

import './style.scss';

class ReaderCombinedCardComponent extends Component {
	static propTypes = {
		currentRoute: PropTypes.string,
		posts: PropTypes.array.isRequired,
		site: PropTypes.object,
		feed: PropTypes.object,
		onClick: PropTypes.func,
		postKey: PropTypes.object.isRequired,
		selectedPostKey: PropTypes.object,
		showFollowButton: PropTypes.bool,
		followSource: PropTypes.string,
		blockedSites: PropTypes.array,
		hasOrganization: PropTypes.bool,
		isWPForTeamsItem: PropTypes.bool,
	};

	static defaultProps = {
		showFollowButton: false,
		blockedSites: [],
	};

	componentDidMount() {
		this.recordRenderTrack();
	}

	componentDidUpdate( prevProps ) {
		if (
			this.props.postKey.feedId !== prevProps.postKey.feedId ||
			this.props.postKey.blogId !== prevProps.postKey.blogId ||
			size( this.props.posts ) !== size( prevProps.posts )
		) {
			this.recordRenderTrack();
		}
	}

	recordRenderTrack = () => {
		const { postKey, posts } = this.props;

		this.props.recordReaderTracksEvent( 'calypso_reader_combined_card_render', {
			blog_id: postKey.blogId,
			feed_id: postKey.feedId,
			post_count: size( posts ),
		} );
	};

	render() {
		const {
			currentRoute,
			posts,
			postKeys,
			site,
			feed,
			postKey,
			selectedPostKey,
			onClick,
			blockedSites,
			translate,
			hasOrganization,
			isWPForTeamsItem,
		} = this.props;
		const feedId = postKey.feedId;
		const siteId = postKey.blogId;
		const siteIcon = get( site, 'icon.img' );
		const feedIcon = get( feed, 'image' );
		const streamUrl = getStreamUrl( feedId, siteId );
		const siteName = getSiteName( { site, post: posts[ 0 ] } );
		const isSelectedPost = ( post ) => keysAreEqual( keyForPost( post ), selectedPostKey );
		const followUrl = ( feed && feed.URL ) || ( site && site.URL );
		const mediaCount = filter(
			posts,
			( post ) => post && ! isEmpty( post.canonical_media )
		).length;

		// Handle blocked sites here rather than in the post lifecycle, because we don't have the posts there
		if ( posts[ 0 ] && ! posts[ 0 ].is_external && includes( blockedSites, +posts[ 0 ].site_ID ) ) {
			return <PostBlocked post={ posts[ 0 ] } />;
		}

		return (
			<Card className="reader-combined-card">
				<header className="reader-combined-card__header">
					<ReaderAvatar
						siteIcon={ siteIcon }
						feedIcon={ feedIcon }
						author={ null }
						preferGravatar
						siteUrl={ streamUrl }
						isCompact
					/>
					<div className="reader-combined-card__header-details">
						<ReaderSiteStreamLink
							className="reader-combined-card__site-link"
							feedId={ feedId }
							siteId={ siteId }
						>
							{ siteName }
						</ReaderSiteStreamLink>
						<p className="reader-combined-card__header-post-count">
							{ translate( '%(count)d posts', {
								args: {
									count: posts.length,
								},
							} ) }
						</p>
					</div>
					{ this.props.showFollowButton && followUrl && (
						<FollowButton siteUrl={ followUrl } followSource={ this.props.followSource } />
					) }
				</header>
				<ul className="reader-combined-card__post-list">
					{ posts.map( ( post, i ) => (
						<ReaderCombinedCardPost
							key={ `post-${ postKey.feedId || postKey.blogId }-${ postKey.postIds[ i ] }` }
							currentRoute={ currentRoute }
							post={ post }
							postKey={ postKeys[ i ] }
							streamUrl={ streamUrl }
							onClick={ onClick }
							isSelected={ isSelectedPost( post ) }
							showFeaturedAsset={ mediaCount > 0 }
							hasOrganization={ hasOrganization }
							isWPForTeamsItem={ isWPForTeamsItem }
						/>
					) ) }
				</ul>
				<div className="reader-combined-card__footer">
					<ReaderPostOptionsMenu
						className="reader-combined-card__options-menu ignore-click"
						showFollow
						showConversationFollow={ false }
						showVisitPost={ false }
						showEditPost={ false }
						showReportSite
						showReportPost={ false }
						post={ posts[ 0 ] }
						posts={ posts }
					/>
				</div>
				{ feedId && <QueryReaderFeed feedId={ +feedId } /> }
				{ siteId && <QueryReaderSite siteId={ +siteId } /> }
			</Card>
		);
	}
}

export function combinedCardPostKeyToKeys( postKey, memoized = null ) {
	if ( ! postKey || ! postKey.postIds ) {
		return [];
	}

	const feedId = postKey.feedId;
	const blogId = postKey.blogId;

	if ( memoized && memoized.lastPostIds === postKey.postIds ) {
		return memoized.lastPostKeys;
	}

	const keys = postKey.postIds.map( ( postId ) => ( { feedId, blogId, postId } ) );

	if ( memoized ) {
		memoized.lastPostIds = postKey.postIds;
		memoized.lastPostKeys = keys;
	}

	return keys;
}

export const ReaderCombinedCard = localize( ReaderCombinedCardComponent );

// React-redux's `connect` allows for a mapStateToProps that returns a function,
// rather than an object, binding it to a particular component instance.
// This allows for memoization, which we strategically use here to maintain
// references and avoid re-rendering large sections of the component tree.
function mapStateToProps( st, ownProps ) {
	const memoized = {};

	return ( state ) => {
		const postKeys = combinedCardPostKeyToKeys( ownProps.postKey, memoized );
		return {
			currentRoute: getCurrentRoute( state ),
			isWPForTeamsItem:
				isFeedWPForTeams( state, ownProps.postKey.feedId ) ||
				isSiteWPForTeams( state, ownProps.postKey.blogId ),
			hasOrganization: hasReaderFollowOrganization(
				state,
				ownProps.postKey.feedId,
				ownProps.postKey.blogId
			),
			posts: getPostsByKeys( state, postKeys ),
			postKeys,
		};
	};
}

export default connect( mapStateToProps, { recordReaderTracksEvent } )( ReaderCombinedCard );
