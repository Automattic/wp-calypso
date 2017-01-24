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
		const Logs = [
			{
				title: 'This is some really cool post',
				subTitle: 'Deleted Post',
				icon: 'trash',
				user: { ID: 123, name: 'Jane A', role: 'Admin' },
				time: '4:32pm',
				actionText: 'Undo',
			},
			{
				title: 'Jetpack updated to 4.5.1',
				subTitle: 'Plugin Update',
				icon: 'plugins',
				user: { ID: 123, name: 'Jane A', role: 'Admin' },
				time: '4:32pm',
				actionText: 'Undo'
			},
			{
				title: 'Post Title',
				subTitle: 'Post Updated',
				icon: 'posts',
				user: { ID: 333, name: 'Jane A', role: 'Admin' },
				time: '10:55am',
				actionText: 'Undo'
			}
		];

		return (
			<div className="activity-log-date">
				<FoldableCard
					header={ <div><div>Jan, 01, 1999</div><div><small> { Logs.length } Events</small></div></div> }
					summary={ <Button className="button">Rewind</Button> }
					expandedSummary={ <Button className="button">Rewind</Button> }
					clickableHeader={ true }
				>
					{ Logs.map( ( log, index )  => {
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
