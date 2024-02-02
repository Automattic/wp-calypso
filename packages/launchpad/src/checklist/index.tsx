import classNames from 'classnames';
import { Placeholder as CheckListPlacehoder } from '../checklist-item';
import type { Props as CheckListItemProps } from '../checklist-item';
import type { FC, PropsWithChildren, ReactElement } from 'react';
import './style.scss';

interface ChecklistProps extends PropsWithChildren {
	items: Array< ReactElement< CheckListItemProps > >;
	makeLastTaskPrimaryAction?: boolean;
}

const Checklist: FC< ChecklistProps > = ( {
	items = [],
	makeLastTaskPrimaryAction,
}: ChecklistProps ) => {
	return (
		<ul
			className={ classNames( 'checklist__tasks', {
				'checklist__has-primary-action': makeLastTaskPrimaryAction,
			} ) }
			aria-label="Launchpad Checklist"
		>
			{ items }
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
