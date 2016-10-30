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

export class ReaderPostCardAdapter extends React.Component {

	onClick = () => {
		this.props.handleClick && this.props.handleClick( this.props.post );
	}

	onCommentClick = () => {
		this.props.handleClick && this.props.handleClick( this.props.post, { comments: true } );
	}

	// take what the stream hands to a card and adapt it
	// for use by a ReaderPostCard
	render() {
		const {
			feed_ID: feedId,
			site_ID: siteId,
			is_external: isExternal
		} = this.props.post;

		// only query the site if the feed id is missing. feed queries end up fetching site info
		// via a meta query, so we don't need both.
		return (
			<ReaderPostCard
				post={ this.props.post }
				site={ this.props.site }
				feed={ this.props.feed }
				onClick={ this.onClick }
				onCommentClick={ this.onCommentClick }
				showPrimaryFollowButton={ this.props.showPrimaryFollowButtonOnCards }>
				{ feedId && <QueryReaderFeed feedId={ feedId } includeMeta={ false } /> }
				{ ! isExternal && siteId && <QueryReaderSite siteId={ +siteId } includeMeta={ false } /> }
			</ReaderPostCard>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteId = get( ownProps, 'post.site_ID' );
		const isExternal = get( ownProps, 'post.is_external' );
		const feedId = get( ownProps, 'post.feed_ID' );
		return {
			site: isExternal ? null : getSite( state, siteId ),
			feed: getFeed( state, feedId )
		};
	}
)( ReaderPostCardAdapter );
