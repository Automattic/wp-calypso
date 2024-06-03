import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import { ReactNode } from 'react';
import './style.scss';

export default function SimpleList( {
	items,
	className,
}: {
	items: ReactNode[];
	className?: string;
} ) {
	return (
		<ul className={ clsx( 'simple-list', className ) }>
			{ items.map( ( item, index ) => (
				<li key={ `item-${ index }` }>
					<Icon className="simple-list-icon" icon={ check } size={ 24 } />
					<div className="simple-list-text">{ item }</div>
				</li>
			) ) }
		</ul>
	);
}
