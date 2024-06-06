import clsx from 'clsx';
import { Children, cloneElement, type FC, type ReactElement, type ComponentProps } from 'react';
import ChecklistItem, { Placeholder as ChecklistItemPlaceholder } from '../checklist-item';
import './style.scss';

interface Props {
	makeLastTaskPrimaryAction?: boolean;
	children?:
		| ReactElement< ComponentProps< typeof ChecklistItem > >
		| ReactElement< ComponentProps< typeof ChecklistItem > >[];
}

const Checklist: FC< Props > = ( { children, makeLastTaskPrimaryAction } ) => {
	const lastChildIndex = Children.count( children ) - 1;

	return (
		<ul
			className={ clsx( 'checklist__tasks', {
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
