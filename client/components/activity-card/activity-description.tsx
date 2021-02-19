/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import FormattedBlock from 'calypso/components/notes-formatted-block';

/**
 * Type dependencies
 */
import { Activity } from 'calypso/state/activity-log/types';

interface Props {
	activity: Activity;
}

const ActivityDescription: FunctionComponent< Props > = ( {
	activity: { activityName, activityDescription },
} ) => (
	<>
		{ activityDescription.map( ( description, index ) => {
			const { intent, section } = description;

			return (
				<FormattedBlock
					content={ description }
					key={ index }
					meta={ { activity: activityName, intent, section } }
				/>
			);
		} ) }
	</>
);

export default ActivityDescription;
