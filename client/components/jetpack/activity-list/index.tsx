/**
 * External dependencies
 */
import React, { ReactNode } from 'react';

/**
 * Internal dependencies
 */
import { ActivityDescriptionPart, LogData } from './types';
import LogItem, { Props as LogItemProps } from '../log-item';
import FormattedBlock from 'calypso/components/notes-formatted-block';

interface Props {
	logs?: LogData;
}

class ActivityList extends React.PureComponent< Props > {
	render() {
		if ( ! this.props.logs ) {
			return [];
		}

		const {
			logs: { data: logItems, state },
		} = this.props;

		if ( 'success' !== state || ! Array.isArray( logItems ) ) {
			return false;
		}

		if ( 0 === logItems.length ) {
			return <p className="activity-list__no-items">No backups found.</p>;
		}

		return logItems.map(
			( { activityId, activityTitle, activityStatus, activityDescription, activityName } ) => {
				let highlight = 'success';
				if ( 'success' !== activityStatus ) {
					highlight = 'error';
				}

				const subheader = activityDescription.map( ( part: ActivityDescriptionPart, i ) => {
					const { intent, section } = part;
					return (
						<FormattedBlock
							key={ i }
							content={ part }
							meta={ { activity: activityName, intent, section } }
						/>
					);
				} );

				return (
					<LogItem
						key={ activityId }
						header={ activityTitle }
						subheader={ subheader as ReactNode }
						highlight={ highlight as LogItemProps[ 'highlight' ] }
					/>
				);
			}
		);
	}
}

export default ActivityList;
