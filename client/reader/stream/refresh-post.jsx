/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

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
		const { feed_ID: feedId, site_ID: siteId } = this.props.post;

		// only query the site if the feed id is missing. feed queries end up fetching site info
		// via a meta query, so we don't need both.
		return (
			<ReaderPostCard
				post={ this.props.post }
				site={ this.props.site }
				feed={ this.props.feed }
				onClick={ this.onClick }
				onCommentClick={ this.onCommentClick } >
				{ feedId && <QueryReaderFeed feedId={ feedId } /> }
				{ ! feedId && siteId && <QueryReaderSite siteId={ +siteId } /> }
			</ReaderPostCard>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			site: getSite( state, ownProps.site_ID ),
			feed: getFeed( state, ownProps.feed_ID )
		};
	}
)( ReaderPostCardAdapter );
