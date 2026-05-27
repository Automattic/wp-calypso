import { Component } from 'react';
import { connect } from 'react-redux';
import ReaderPostCard from 'calypso/blocks/reader-post-card';
import QueryReaderFeed from 'calypso/components/data/query-reader-feed';
import { useCommentsApiDisabled } from 'calypso/reader/data/comments';
import { withSite } from 'calypso/reader/data/site';
import { recordAction, recordGaEvent, recordTrackForPost } from 'calypso/reader/stats';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import { getReaderFollowForFeed } from 'calypso/state/reader/follows/selectors';

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
		const { feed_ID: feedId } = this.props.post;

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
				commentsApiDisabled={ this.props.commentsApiDisabled }
				showBylineSecondarySiteLink={ this.props.showBylineSecondarySiteLink }
			>
				<div ref={ this.props.postRef }>{ feedId && <QueryReaderFeed feedId={ feedId } /> }</div>
			</ReaderPostCard>
		);
	}
}

const getPostSiteId = ( { post } ) =>
	post && ! post.is_external && post.site_ID ? +post.site_ID : undefined;

const ConnectedReaderPostCardAdapter = connect( ( state, ownProps ) => {
	const post = ownProps.post;
	const feedId = post?.feed_ID;
	const feed = getFeed( state, feedId );

	// Add site icon to feed object so have icon for external feeds
	if ( feed ) {
		const follow = getReaderFollowForFeed( state, parseInt( feedId ) );
		feed.site_icon = follow?.site_icon;
	}

	return {
		feed: feed,
	};
} )( withSite( ReaderPostCardAdapter, getPostSiteId ) );

export default function ReaderPostCardAdapterContainer( props ) {
	const { is_external: isExternal, site_ID: siteId } = props.post ?? {};
	const commentsApiDisabled = useCommentsApiDisabled( siteId );

	return (
		<ConnectedReaderPostCardAdapter
			{ ...props }
			commentsApiDisabled={ isExternal ? false : commentsApiDisabled }
		/>
	);
}
