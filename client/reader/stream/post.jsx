import { Component } from 'react';
import { connect } from 'react-redux';
import ReaderPostCard from 'calypso/blocks/reader-post-card';
import QueryReaderFeed from 'calypso/components/data/query-reader-feed';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import { recordAction, recordGaEvent, recordTrackForPost } from 'calypso/reader/stats';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import { getReaderFollowForFeed } from 'calypso/state/reader/follows/selectors';
import { getSite } from 'calypso/state/reader/sites/selectors';

class ReaderPostCardAdapter extends Component {
	static displayName = 'ReaderPostCardAdapter';

	onClick = ( postToOpen ) => {
		this.props.handleClick &&
			this.props.handleClick( {
				post: postToOpen,
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
		const { feed_ID: feedId, site_ID: siteId, is_external: isExternal } = this.props.post;

		// only query the site if the feed id is missing. feed queries end up fetching site info
		// via a meta query, so we don't need both.
		return (
			<ReaderPostCard
				post={ this.props.post }
				site={ this.props.site }
				feed={ this.props.feed }
				onClick={ this.onClick }
				onCommentClick={ this.onCommentClick }
				handleClick={ this.props.handleClick }
				isSelected={ this.props.isSelected }
				followSource={ this.props.followSource }
				showSiteName={ this.props.showSiteName }
				isDiscoverStream={ this.props.isDiscoverStream }
				postKey={ this.props.postKey }
				compact={ this.props.compact }
				showFollowButton={ this.props.showFollowButton }
				fixedHeaderHeight={ this.props.fixedHeaderHeight }
				streamKey={ this.props.streamKey }
			>
				<div ref={ this.props.postRef }>
					{ feedId && <QueryReaderFeed feedId={ feedId } /> }
					{ ! isExternal && siteId && <QueryReaderSite siteId={ +siteId } /> }
				</div>
			</ReaderPostCard>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const post = ownProps.post;
	const siteId = post?.site_ID;
	const isExternal = post?.is_external;
	const feedId = post?.feed_ID;
	const feed = getFeed( state, feedId );

	// Add site icon to feed object so have icon for external feeds
	if ( feed ) {
		const follow = getReaderFollowForFeed( state, parseInt( feedId ) );
		feed.site_icon = follow?.site_icon;
	}

	return {
		site: isExternal ? null : getSite( state, siteId ),
		feed: feed,
	};
} )( ReaderPostCardAdapter );
