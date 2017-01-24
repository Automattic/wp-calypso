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
		const {
			logs
		} = this.props;


		return (
			<div className="activity-log-date">
				<FoldableCard
					header={ <div><div>Jan, 01, 1999</div><div><small> { logs.length } Events</small></div></div> }
					summary={ <Button className="button">Rewind</Button> }
					expandedSummary={ <Button className="button">Rewind</Button> }
					clickableHeader={ true }
				>
					{ logs.map( ( log, index )  => {
						return <ActivityLogItem
							title={ log.title }
							subTitle={ log.subTitle }
							icon={ log.icon }
							time={ log.time }
							user={ log.user }
							actionText={ log.actionText }
							key={ 'activity-log' + index } />
					} ) }
				</FoldableCard>
			</div>
		);
	}
} );

export default localize( ActivityLogDate );
