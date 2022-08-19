import { useEffect, useState } from 'react';
import useSiteChecklist from 'calypso/data/site-checklist/use-site-checklist';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { getTask } from 'calypso/my-sites/customer-home/cards/tasks/site-setup-list/get-task';
import ChecklistItem from './checklist-item';
import { LaunchpadTask } from './types';

interface ChecklistProps {
	siteId: number;
}

const Checklist = ( { siteId }: ChecklistProps ) => {
	const [ checklist, setChecklist ] = useState< LaunchpadTask[] >( [] );
	const siteSlug = useSiteSlugParam();
	const rawChecklist = useSiteChecklist( siteId.toString() );

	useEffect( () => {
		if ( rawChecklist ) {
			const enhancedChecklist = rawChecklist.tasks.map( ( rawTask ) =>
				getTask( rawTask, { siteSlug } )
			);
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
