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
import Gridicon from 'gridicons';

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
					<h1 className="following-manage__subscriptions-controls-heading">
						{
							translate( '%(num)s Followed Sites', {
								args: { num: follows.length }
							} )
						}
						</h1>
					<FollowingManageSortControls />
					<div className="following-manage__subscriptions-controls-search">
						<FollowingManageSearchFollowed />
					</div>
					<Gridicon icon="ellipsis" size={ 24 } />
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
