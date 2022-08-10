import ChecklistItem from './checklist-item';
import { Task } from './types';

const Checklist = ( { tasks }: { tasks: Task[] } ) => (
	<ul className="launchpad__checklist" aria-label="Launchpad Checklist">
		{ tasks.map( ( task ) => (
			<ChecklistItem key={ task.id } task={ task } />
		) ) }
	</ul>
);

export default Checklist;
