/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Popover from 'components/info-popover/index';
import SegmentedControl from 'components/segmented-control';
import ControlItem from 'components/segmented-control/item';

class ReaderEmailSubscriptionSettingsPopout extends Component {
	static displayName = 'ReaderEmailSubscriptionSettingsPopout';
	static propTypes = {
		feedId: PropTypes.number,
		siteId: PropTypes.number,
	};

	render() {
		return (
			<Popover>
				<h3>Email me</h3>
				<div>
					<span> New posts</span>

				</div>
				<SegmentedControl>
					<ControlItem>
						Instant
					</ControlItem>
					<ControlItem>
						Daily
					</ControlItem>
					<ControlItem>
						Weekly
					</ControlItem>
				</SegmentedControl>
			</Popover>
		);
	}
}

export default localize( ReaderEmailSubscriptionSettingsPopout );

