/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { getReaderFollows } from 'state/selectors';

/**
 * Internal Dependencies
 */
import ReaderImportButton from 'blocks/reader-import-button';
import ReaderExportButton from 'blocks/reader-export-button';
import SitesWindowScroller from './sites-window-scroller';
import QueryReaderFollows from 'components/data/query-reader-follows';
import FollowingManageSearchFollowed from './search-followed';

class FollowingManageSubscriptions extends Component {
	static propTypes = {
		follows: PropTypes.array.isRequired,
	};

	render() {
		const { follows, width, translate } = this.props;
		return (
			<div className="following-manage__subscriptions">
				<QueryReaderFollows />
				<div className="following-manage__subscriptions-controls">
					{
						translate( '%(num)s Followed Sites', {
							args: { num: follows.length }
						} )
					}
					<ReaderImportButton />
					<ReaderExportButton />
					<FollowingManageSearchFollowed />
				</div>
				<div className="following-manage__subscriptions-list">
					<SitesWindowScroller
						sites={ follows }
						width={ width }
					/>
				</div>
			</div>
		);
	}
}

export default connect(
	state => ( { follows: getReaderFollows( state ) } ),
)( localize( FollowingManageSubscriptions ) );
