import classNames from 'classnames';
import { Children, cloneElement, type FC, type ReactElement } from 'react';
import { Placeholder as ChecklistPlaceholder } from '../checklist-item';
import type { Props as CheckListItemProps } from '../checklist-item';
import './style.scss';

interface ChecklistProps {
	makeLastTaskPrimaryAction?: boolean;
	children?: ReactElement< CheckListItemProps > | ReactElement< CheckListItemProps >[];
}

const Checklist: FC< ChecklistProps > = ( {
	children,
	makeLastTaskPrimaryAction,
}: ChecklistProps ) => {
	return (
		<ul
			className={ classNames( 'checklist__tasks', {
				'checklist__has-primary-action': makeLastTaskPrimaryAction,
			} ) }
			aria-label="Launchpad Checklist"
		>
			{ Children.map( children || [], ( child, index ) => {
				if ( index === Children.count( children ) - 1 ) {
					return cloneElement( child, { isPrimaryAction: makeLastTaskPrimaryAction } );
				}
				return child;
			} ) }
		</ul>
	);
};

export const Placeholder = () => {
	return (
		<ul className="checklist__tasks" aria-label="Launchpad Checklist">
			<ChecklistPlaceholder />
			<ChecklistPlaceholder />
			<ChecklistPlaceholder />
			<ChecklistPlaceholder />
		</ul>
	);
};

export default Checklist;
