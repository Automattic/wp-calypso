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
	activityName: string;
	activityMeta: {};
	activityDescription: [
		{
			intent: string;
			section: string;
			children: string[];
		}
	];
}

interface Props {
	activity: Activity;
}

const ActivityDescription: FunctionComponent< Props > = ( {
	activity: { activityName, activityMeta, activityDescription },
} ) => {
	return (
		<>
			{ activityDescription.map( ( part, index ) => {
				const { intent, section, children } = part;
				return (
					<FormattedBlock
						key={ index }
						content={ children }
						meta={ { activity: activityName, intent, section } }
					/>
				);
			} ) }{ ' ' }
		</>
	);
};

export default ActivityDescription;
