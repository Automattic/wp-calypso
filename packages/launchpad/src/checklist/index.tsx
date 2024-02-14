import classNames from 'classnames';
import { Children, cloneElement, type FC, type ReactElement } from 'react';
import { Placeholder as ChecklistItemPlaceholder } from '../checklist-item';
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
	const lastChildIndex = Children.count( children ) - 1;

	return (
		<ul
			className={ classNames( 'checklist__tasks', {
				'checklist__has-primary-action': makeLastTaskPrimaryAction,
			} ) }
			aria-label="Launchpad Checklist"
		>
			{ Children.map( children || [], ( child, index ) => {
				if ( index === lastChildIndex ) {
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
			<ChecklistItemPlaceholder />
			<ChecklistItemPlaceholder />
			<ChecklistItemPlaceholder />
			<ChecklistItemPlaceholder />
		</ul>
	);
};

export default Checklist;
