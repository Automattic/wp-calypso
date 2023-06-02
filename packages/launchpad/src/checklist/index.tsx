import ChecklistItem from '../checklist-item';
import { Task } from '../types';

import './style.scss';

interface ChecklistProps {
	tasks: Task[] | null;
}

const Checklist = ( { tasks }: ChecklistProps ) => {
	return (
		<ul className="checklist__tasks" aria-label="Launchpad Checklist">
			{ tasks &&
				tasks.map( ( task: Task, index: number ) => (
					<ChecklistItem
						key={ task.id }
						task={ task }
						isPrimaryAction={ tasks.length - 1 === index }
					/>
				) ) }
		</ul>
	);
};

Checklist.Placeholder = () => {
	return (
		<ul className="checklist__tasks" aria-label="Launchpad Checklist">
			<ChecklistItem.Placeholder />
			<ChecklistItem.Placeholder />
			<ChecklistItem.Placeholder />
			<ChecklistItem.Placeholder />
		</ul>
	);
};

export default Checklist;
