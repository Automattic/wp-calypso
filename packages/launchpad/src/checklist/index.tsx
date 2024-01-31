import classNames from 'classnames';
import ChecklistItem, { Placeholder as CheckListPlacehoder } from '../checklist-item';
import type { Task } from '../types';
import type { FC } from 'react';
import './style.scss';

interface ChecklistProps {
	tasks: Task[] | null;
	makeLastTaskPrimaryAction?: boolean;
}

const Checklist: FC< ChecklistProps > = ( {
	tasks,
	makeLastTaskPrimaryAction,
}: ChecklistProps ) => {
	return (
		<ul
			className={ classNames( 'checklist__tasks', {
				'checklist__has-primary-action': makeLastTaskPrimaryAction,
			} ) }
			aria-label="Launchpad Checklist"
		>
			{ tasks &&
				tasks.map( ( task: Task, index: number ) => (
					<ChecklistItem
						key={ task.id }
						task={ task }
						isPrimaryAction={ makeLastTaskPrimaryAction && index === tasks.length - 1 }
					/>
				) ) }
		</ul>
	);
};

export const Placeholder = () => {
	return (
		<ul className="checklist__tasks" aria-label="Launchpad Checklist">
			<CheckListPlacehoder />
			<CheckListPlacehoder />
			<CheckListPlacehoder />
			<CheckListPlacehoder />
		</ul>
	);
};

export default Checklist;
