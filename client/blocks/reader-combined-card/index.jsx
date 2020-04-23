/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { get, size, filter, isEmpty, includes } from 'lodash';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import { Card } from '@automattic/components';
import { getStreamUrl } from 'reader/route';
import ReaderAvatar from 'blocks/reader-avatar';
import ReaderSiteStreamLink from 'blocks/reader-site-stream-link';
import ReaderCombinedCardPost from './post';
import { keysAreEqual, keyForPost } from 'reader/post-key';
import QueryReaderSite from 'components/data/query-reader-site';
import QueryReaderFeed from 'components/data/query-reader-feed';
import { recordTrack } from 'reader/stats';
import { getSiteName } from 'reader/get-helpers';
import FollowButton from 'reader/follow-button';
import { getPostsByKeys } from 'state/reader/posts/selectors';
import ReaderPostOptionsMenu from 'blocks/reader-post-options-menu';
import PostBlocked from 'blocks/reader-post-card/blocked';

/**
 * Style dependencies
 */
import './style.scss';

class ReaderCombinedCardComponent extends React.Component {
	static propTypes = {
		posts: PropTypes.array.isRequired,
		site: PropTypes.object,
		feed: PropTypes.object,
		onClick: PropTypes.func,
		isDiscover: PropTypes.bool,
		postKey: PropTypes.object.isRequired,
		selectedPostKey: PropTypes.object,
		showFollowButton: PropTypes.bool,
		followSource: PropTypes.string,
		blockedSites: PropTypes.array,
	};

	static defaultProps = {
		isDiscover: false,
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

		recordTrack( 'calypso_reader_combined_card_render', {
			blog_id: postKey.blogId,
			feed_id: postKey.feedId,
			post_count: size( posts ),
		} );
	};

	render() {
		const {
			posts,
			postKeys,
			site,
			feed,
			postKey,
			selectedPostKey,
			onClick,
			isDiscover,
			blockedSites,
			translate,
		} = this.props;
		const feedId = postKey.feedId;
		const siteId = postKey.blogId;
		const siteIcon = get( site, 'icon.img' );
		const feedIcon = get( feed, 'image' );
		const streamUrl = getStreamUrl( feedId, siteId );
		const siteName = getSiteName( { site, post: posts[ 0 ] } );
		const isSelectedPost = ( post ) => keysAreEqual( keyForPost( post ), selectedPostKey );
		const followUrl = ( feed && feed.URL ) || ( site && site.URL );
		const mediaCount = filter( posts, ( post ) => post && ! isEmpty( post.canonical_media ) )
			.length;

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
						preferGravatar={ true }
						siteUrl={ streamUrl }
						isCompact={ true }
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
							post={ post }
							postKey={ postKeys[ i ] }
							streamUrl={ streamUrl }
							onClick={ onClick }
							isDiscover={ isDiscover }
							isSelected={ isSelectedPost( post ) }
							showFeaturedAsset={ mediaCount > 0 }
						/>
					) ) }
				</ul>
				<div className="reader-combined-card__footer">
					<ReaderPostOptionsMenu
						className="reader-combined-card__options-menu ignore-click"
						showFollow={ true }
						showConversationFollow={ false }
						showVisitPost={ false }
						showEditPost={ false }
						showReportSite={ true }
						showReportPost={ false }
						post={ posts[ 0 ] }
					/>
				</div>
				{ feedId && <QueryReaderFeed feedId={ +feedId } includeMeta={ false } /> }
				{ siteId && <QueryReaderSite siteId={ +siteId } includeMeta={ false } /> }
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
			posts: getPostsByKeys( state, postKeys ),
			postKeys,
		};
	};
}

export default connect( mapStateToProps )( ReaderCombinedCard );
