import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withReaderTeams } from 'calypso/components/data/with-reader-teams';
import { useFeedQuery } from 'calypso/reader/data/feed';
import { withSite } from 'calypso/reader/data/site';
import ReaderPostEllipsisMenu from './reader-post-ellipsis-menu';
import './style.scss';

class ReaderPostOptionsMenu extends Component {
	static propTypes = {
		post: PropTypes.object,
		feed: PropTypes.object,
		followSource: PropTypes.string,
		openSuggestedFollows: PropTypes.func,
		showFollow: PropTypes.bool,
		showVisitPost: PropTypes.bool,
		showReportPost: PropTypes.bool,
		showReportSite: PropTypes.bool,
		showEditPost: PropTypes.bool,
		showConversationFollow: PropTypes.bool,
		teams: PropTypes.array,
	};

	render() {
		const {
			post,
			site,
			feed,
			followSource,
			teams,
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
				<ReaderPostEllipsisMenu
					feed={ feed }
					site={ site }
					teams={ teams }
					post={ post }
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

const ConnectedReaderPostOptionsMenu = compose(
	withReaderTeams,
	connect( ( _state, { post: { is_external: isExternal, site_ID: siteId } = {} } ) =>
		Object.assign( {}, ! isExternal && siteId > 0 && { siteId: +siteId } )
	),
	withSite
)( ReaderPostOptionsMenu );

export default function ReaderPostOptionsMenuContainer( props ) {
	const { data: feed } = useFeedQuery( props.post?.feed_ID );

	return <ConnectedReaderPostOptionsMenu { ...props } feed={ feed } />;
}
