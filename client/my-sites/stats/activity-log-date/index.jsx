/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import Button from 'components/button';
import ActivityLogItem from '../activity-log-item';

const ActivityLogDate = React.createClass( {

	render() {
		return (
			<div className="activity-log-date">
				<FoldableCard
					header={ <div><div>Jan, 01, 1999</div><div><small> 17 Events</small></div></div> }
					headerExpanded={ <div><div>Jan, 01, 1999</div><div><small> 17 Events</small></div></div> }
					summary={ <Button className="button">Rewind</Button> }
					expandedSummary={ <Button className="button">Rewind</Button> }
					clickableHeader={ true }
				>
					<ActivityLogItem />
					<ActivityLogItem />
					<ActivityLogItem />
				</FoldableCard>
			</div>
		);
	}
} );

export default localize( ActivityLogDate );
