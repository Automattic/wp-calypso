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
import SitesWindowScroller from './sites-window-scroller';
import QueryReaderFollows from 'components/data/query-reader-follows';
import FollowingManageSortControls from './sort-controls';
import FollowingManageSearchFollowed from './search-followed';
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';

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
					<h1 className="following-manage__subscriptions-heading">
						{
							translate( '%(num)s Followed Sites', {
								args: { num: follows.length }
							} )
						}
						</h1>
					<div className="following-manage__subscriptions-sort">
						<FollowingManageSortControls />
					</div>
					<div className="following-manage__subscriptions-search">
						<FollowingManageSearchFollowed />
					</div>
					<div className="following-manage__subscriptions-import-export">
						<EllipsisMenu toggleTitle={ translate( 'More' ) }>
							<PopoverMenuItem icon="cloud-upload">{ translate( 'Import' ) }</PopoverMenuItem>
							<PopoverMenuItem icon="cloud-download">{ translate( 'Export' ) }</PopoverMenuItem>
						</EllipsisMenu>
					</div>
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
