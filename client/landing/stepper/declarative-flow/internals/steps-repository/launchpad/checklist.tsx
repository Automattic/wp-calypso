import ChecklistItem from './checklist-item';
import { Task } from './types';

interface ChecklistProps {
	tasks: Task[] | null;
}

const Checklist = ( { tasks }: ChecklistProps ) => {
	return (
		<ul className="launchpad__checklist" aria-label="Launchpad Checklist">
			{ tasks && tasks.map( ( task: Task ) => <ChecklistItem key={ task.id } task={ task } /> ) }
		</ul>
	);
};

export default Checklist;
