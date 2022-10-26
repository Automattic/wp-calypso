import ChecklistItem from './checklist-item';
import { Task } from './types';

interface ChecklistProps {
	tasks: Task[] | null;
}

const Checklist = ( { tasks }: ChecklistProps ) => {
	return (
		<ul className="launchpad__checklist" aria-label="Launchpad Checklist">
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

export default Checklist;
