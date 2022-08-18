import { useEffect, useState } from 'react';
import useSiteChecklist from 'calypso/data/site-checklist/use-site-checklist';
import ChecklistItem from './checklist-item';
import { transformTasks } from './transform-tasks';
import { LaunchpadTask } from './types';

interface ChecklistProps {
	siteId: number;
}

const Checklist = ( { siteId }: ChecklistProps ) => {
	const [ checklist, setChecklist ] = useState< LaunchpadTask[] >( [] );
	const rawChecklist = useSiteChecklist( siteId.toString() );

	useEffect( () => {
		if ( rawChecklist ) {
			const enhancedChecklist = transformTasks( rawChecklist.tasks );
			setChecklist( enhancedChecklist );
		}
	}, [ rawChecklist ] );

	return (
		<ul className="launchpad__checklist" aria-label="Launchpad Checklist">
			{ checklist.map( ( task ) => (
				<ChecklistItem key={ task.id } task={ task } />
			) ) }
		</ul>
	);
};

export default Checklist;
