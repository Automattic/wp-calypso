import { Component } from 'react';
import ReaderPostCard from 'calypso/blocks/reader-post-card';
import { useCommentsApiDisabled } from 'calypso/reader/data/comments';
import { useFeedQuery } from 'calypso/reader/data/feed';
import { withSite } from 'calypso/reader/data/site';
import { useSiteSubscriptionForFeed } from 'calypso/reader/data/site-subscriptions';
import { recordAction, recordGaEvent, recordTrackForPost } from 'calypso/reader/stats';

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
				<div ref={ this.props.postRef } />
			</ReaderPostCard>
		);
	}
}

const getPostSiteId = ( { post } ) =>
	post && ! post.is_external && post.site_ID ? +post.site_ID : undefined;

const ConnectedReaderPostCardAdapter = withSite( ReaderPostCardAdapter, getPostSiteId );

export default function ReaderPostCardAdapterContainer( props ) {
	const { feed_ID: feedId, is_external: isExternal, site_ID: siteId } = props.post ?? {};
	const commentsApiDisabled = useCommentsApiDisabled( siteId );
	const { data: feed } = useFeedQuery( feedId );
	const follow = useSiteSubscriptionForFeed( feedId );
	const feedWithIcon = feed ? { ...feed, site_icon: follow?.site_icon } : feed;

	return (
		<ConnectedReaderPostCardAdapter
			{ ...props }
			feed={ feedWithIcon }
			commentsApiDisabled={ isExternal ? false : commentsApiDisabled }
		/>
	);
}
