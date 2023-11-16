import { FunctionComponent } from 'react';
import FormattedBlock from 'calypso/components/notes-formatted-block';
import { Activity } from 'calypso/state/activity-log/types';

interface Props {
	activity: Activity;
}

const ActivityDescription: FunctionComponent< Props > = ( {
	activity: { activityName, activityDescription },
} ) => (
	<>
		{ activityDescription.map( ( description, index ) => {
			const { intent, section, published } = description;

			return (
				<FormattedBlock
					content={ description }
					key={ index }
					meta={ { activity: activityName, intent, section, published } }
				/>
			);
		} ) }
	</>
);

export default ActivityDescription;
