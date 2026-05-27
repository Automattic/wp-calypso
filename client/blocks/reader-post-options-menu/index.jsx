import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryReaderFeed from 'calypso/components/data/query-reader-feed';
import { withReaderTeams } from 'calypso/components/data/with-reader-teams';
import { withSite } from 'calypso/reader/data/site';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import ReaderPostEllipsisMenu from './reader-post-ellipsis-menu';
import './style.scss';

class ReaderPostOptionsMenu extends Component {
	static propTypes = {
		post: PropTypes.object,
		feed: PropTypes.object,
		followSource: PropTypes.string,
		onBlock: PropTypes.func,
		openSuggestedFollows: PropTypes.func,
		showFollow: PropTypes.bool,
		showVisitPost: PropTypes.bool,
		showEditPost: PropTypes.bool,
		showConversationFollow: PropTypes.bool,
		showReportPost: PropTypes.bool,
		showReportSite: PropTypes.bool,
		position: PropTypes.string,
		posts: PropTypes.array,
		teams: PropTypes.array,
	};

	render() {
		const {
			post,
			site,
			feed,
			followSource,
			teams,
			translate,
			position,
			posts,
			onBlock,
			openSuggestedFollows,
			showVisitPost,
			showReportPost,
			showReportSite,
			showEditPost,
			showFollow,
			showConversationFollow,
		} = this.props;

		if ( ! post ) {
			return null;
		}

		const classes = clsx( 'reader-post-options-menu', this.props.className );

		return (
			<span className={ classes }>
				{ ! feed && post && post.feed_ID && <QueryReaderFeed feedId={ +post.feed_ID } /> }
				<ReaderPostEllipsisMenu
					site={ site }
					teams={ teams }
					translate={ translate }
					position={ position }
					post={ post }
					posts={ posts }
					onBlock={ onBlock }
					showVisitPost={ showVisitPost }
					showReportPost={ showReportPost }
					showReportSite={ showReportSite }
					showEditPost={ showEditPost }
					showFollow={ showFollow }
					showConversationFollow={ showConversationFollow }
					openSuggestedFollows={ openSuggestedFollows }
					followSource={ followSource }
				/>
			</span>
		);
	}
}

export default compose(
	withReaderTeams,
	connect(
		( state, { post: { feed_ID: feedId, is_external: isExternal, site_ID: siteId } = {} } ) =>
			Object.assign(
				{},
				feedId > 0 && { feed: getFeed( state, feedId ) },
				! isExternal && siteId > 0 && { siteId: +siteId }
			)
	),
	withSite,
	localize
)( ReaderPostOptionsMenu );
