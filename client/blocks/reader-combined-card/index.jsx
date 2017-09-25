/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { get, size, filter, isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import ReaderCombinedCardPost from './post';
import ReaderAvatar from 'blocks/reader-avatar';
import ReaderSiteStreamLink from 'blocks/reader-site-stream-link';
import Card from 'components/card';
import QueryReaderFeed from 'components/data/query-reader-feed';
import QueryReaderSite from 'components/data/query-reader-site';
import { keysAreEqual, keyForPost } from 'lib/feed-stream-store/post-key';
import FollowButton from 'reader/follow-button';
import { getSiteName } from 'reader/get-helpers';
import { getStreamUrl } from 'reader/route';
import { recordTrack } from 'reader/stats';

class ReaderCombinedCard extends React.Component {
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
	};

	static defaultProps = {
		isDiscover: false,
		showFollowButton: false,
	};

	componentDidMount() {
		this.recordRenderTrack();
	}

	componentWillReceiveProps( nextProps ) {
		if (
			this.props.postKey.feedId !== nextProps.postKey.feedId ||
			this.props.postKey.blogId !== nextProps.postKey.blogId ||
			size( this.props.posts ) !== size( nextProps.posts )
		) {
			this.recordRenderTrack( nextProps );
		}
	}

	recordRenderTrack = ( props = this.props ) => {
		const { postKey, posts } = props;

		recordTrack( 'calypso_reader_combined_card_render', {
			blog_id: postKey.blogId,
			feed_id: postKey.feedId,
			post_count: size( posts ),
		} );
	};

	render() {
		const {
			posts,
			site,
			feed,
			postKey,
			selectedPostKey,
			onClick,
			isDiscover,
			translate,
		} = this.props;
		const feedId = postKey.feedId;
		const siteId = postKey.blogId;
		const siteIcon = get( site, 'icon.img' );
		const feedIcon = get( feed, 'image' );
		const streamUrl = getStreamUrl( feedId, siteId );
		const siteName = getSiteName( { site, post: posts[ 0 ] } );
		const isSelectedPost = post => keysAreEqual( keyForPost( post ), selectedPostKey );
		const followUrl = ( feed && feed.URL ) || ( site && site.URL );
		const mediaCount = filter( posts, post => ! isEmpty( post.canonical_media ) ).length;

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
					{ this.props.showFollowButton &&
					followUrl && (
						<FollowButton siteUrl={ followUrl } followSource={ this.props.followSource } />
					) }
				</header>
				<ul className="reader-combined-card__post-list">
					{ posts.map( post => (
						<ReaderCombinedCardPost
							key={ `post-${ post.ID }` }
							post={ post }
							streamUrl={ streamUrl }
							onClick={ onClick }
							isDiscover={ isDiscover }
							isSelected={ isSelectedPost( post ) }
							showFeaturedAsset={ mediaCount > 0 }
						/>
					) ) }
				</ul>
				{ feedId && <QueryReaderFeed feedId={ +feedId } includeMeta={ false } /> }
				{ siteId && <QueryReaderSite siteId={ +siteId } includeMeta={ false } /> }
			</Card>
		);
	}
}

export default localize( ReaderCombinedCard );
