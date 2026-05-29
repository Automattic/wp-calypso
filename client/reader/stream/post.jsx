import { Component } from 'react';
import { connect, useSelector } from 'react-redux';
import ReaderPostCard from 'calypso/blocks/reader-post-card';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import { useCommentsApiDisabled } from 'calypso/reader/data/comments';
import { useFeedQuery } from 'calypso/reader/data/feed';
import { recordAction, recordGaEvent, recordTrackForPost } from 'calypso/reader/stats';
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
		const { site_ID: siteId, is_external: isExternal } = this.props.post;

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
				commentsApiDisabled={ this.props.commentsApiDisabled }
				showBylineSecondarySiteLink={ this.props.showBylineSecondarySiteLink }
			>
				<div ref={ this.props.postRef }>
					{ ! isExternal && siteId && <QueryReaderSite siteId={ +siteId } /> }
				</div>
			</ReaderPostCard>
		);
	}
}

const ConnectedReaderPostCardAdapter = connect( ( state, ownProps ) => {
	const post = ownProps.post;
	const siteId = post?.site_ID;
	const isExternal = post?.is_external;

	return {
		site: isExternal ? null : getSite( state, siteId ),
	};
} )( ReaderPostCardAdapter );

export default function ReaderPostCardAdapterContainer( props ) {
	const { feed_ID: feedId, is_external: isExternal, site_ID: siteId } = props.post ?? {};
	const commentsApiDisabled = useCommentsApiDisabled( siteId );
	const { data: feed } = useFeedQuery( feedId );
	const follow = useSelector( ( state ) =>
		feedId ? getReaderFollowForFeed( state, parseInt( feedId ) ) : null
	);
	const feedWithIcon = feed ? { ...feed, site_icon: follow?.site_icon } : feed;

	return (
		<ConnectedReaderPostCardAdapter
			{ ...props }
			feed={ feedWithIcon }
			commentsApiDisabled={ isExternal ? false : commentsApiDisabled }
		/>
	);
}
