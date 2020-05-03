/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import ReaderPostCard from 'blocks/reader-post-card';
import { getSite } from 'state/reader/sites/selectors';
import { getFeed } from 'state/reader/feeds/selectors';
import QueryReaderSite from 'components/data/query-reader-site';
import QueryReaderFeed from 'components/data/query-reader-feed';
import { recordAction, recordGaEvent, recordTrackForPost } from 'reader/stats';
import { getSourceData as getDiscoverSourceData, discoverBlogId } from 'reader/discover/helper';
import { getPostByKey } from 'state/reader/posts/selectors';
import QueryReaderPost from 'components/data/query-reader-post';

class ReaderPostCardAdapter extends React.Component {
	static displayName = 'ReaderPostCardAdapter';

	onClick = ( postToOpen ) => {
		let referredPost;
		if ( get( this.props, 'discoverPost' ) ) {
			referredPost = {
				...postToOpen,
				referral: {
					blogId: discoverBlogId,
					postId: this.props.post.ID,
				},
			};
		}
		this.props.handleClick &&
			this.props.handleClick( {
				post: referredPost || postToOpen,
			} );
	};

	onCommentClick = () => {
		recordAction( 'click_comments' );
		recordGaEvent( 'Clicked Post Comment Button' );
		recordTrackForPost( 'calypso_reader_post_comments_button_clicked', this.props.post );

		this.props.handleClick &&
			this.props.handleClick( {
				post: this.props.post,
				comments: true,
			} );
	};

	// take what the stream hands to a card and adapt it
	// for use by a ReaderPostCard
	render() {
		const {
			feed_ID: feedId,
			site_ID: siteId,
			is_external: isExternal,
			is_discover: isDiscover,
		} = this.props.post;

		// if this is a discover pick query for the discover pick site
		const discoverPostKey = getDiscoverSourceData( this.props.post );
		const hasDiscoverSourcePost = !! discoverPostKey.postId;

		// only query the site if the feed id is missing. feed queries end up fetching site info
		// via a meta query, so we don't need both.
		return (
			<ReaderPostCard
				post={ this.props.post }
				discoverPost={ this.props.discoverPost }
				discoverSite={ this.props.discoverSite }
				site={ this.props.site }
				feed={ this.props.feed }
				onClick={ this.onClick }
				onCommentClick={ this.onCommentClick }
				isSelected={ this.props.isSelected }
				showPrimaryFollowButton={ this.props.showPrimaryFollowButtonOnCards }
				followSource={ this.props.followSource }
				showSiteName={ this.props.showSiteName }
				isDiscoverStream={ this.props.isDiscoverStream }
				postKey={ this.props.postKey }
				compact={ this.props.compact }
			>
				{ feedId && <QueryReaderFeed feedId={ feedId } includeMeta={ false } /> }
				{ ! isExternal && siteId && <QueryReaderSite siteId={ +siteId } includeMeta={ false } /> }
				{ isDiscover && (
					<QueryReaderSite siteId={ discoverPostKey.blogId } includeMeta={ false } />
				) }
				{ hasDiscoverSourcePost && <QueryReaderPost postKey={ discoverPostKey } /> }
			</ReaderPostCard>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const post = ownProps.post;
	const siteId = get( post, 'site_ID' );
	const isExternal = get( post, 'is_external' );
	const feedId = get( post, 'feed_ID' );
	const isDiscover = get( post, 'is_discover' );
	const isDiscoverStream = ownProps.isDiscoverStream;

	let discoverPost = undefined;
	let discoverSite = undefined;
	if ( isDiscover ) {
		const discoverPostKey = getDiscoverSourceData( post );
		discoverPost = getPostByKey( state, discoverPostKey );

		if ( isDiscoverStream ) {
			discoverSite = getSite( state, discoverPostKey.blogId );
		}
	}

	return {
		site: isExternal ? null : getSite( state, siteId ),
		feed: getFeed( state, feedId ),
		discoverPost,
		discoverSite,
	};
} )( ReaderPostCardAdapter );
