import { FunctionComponent } from 'react';
import * as Blocks from 'calypso/components/notes-formatted-block/blocks';
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

			console.debug( 'oo', description );

			// TODO revert all of this! This is currently being used as a playground for the
			// notes-formatted-block tests.
			return (
				<Blocks.Link
					onClick={ 'foo' }
					content={ { url: `https://wordpress.com${ 'bar' }` } }
					children={ 'fooo' }
				/>
			);
		} ) }
	</>
);

export default ActivityDescription;
