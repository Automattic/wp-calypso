/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import FormattedBlock from 'components/notes-formatted-block';

// FUTURE WORK: move this to a shared location
interface Activity {
	activityDescription: [
		{
			intent?: string;
			section?: string;
			type?: string;
			url?: string;
		}
	];
	activityName: string;
}

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
