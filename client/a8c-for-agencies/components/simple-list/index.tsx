import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import { ReactNode } from 'react';
import './style.scss';

export default function SimpleList( {
	items,
	className,
	icon,
}: {
	items: ReactNode[];
	className?: string;
	icon?: ReactNode;
} ) {
	return (
		<ul className={ clsx( 'simple-list', className ) }>
			{ items.map( ( item, index ) => (
				<li key={ `item-${ index }` }>
					{ icon ?? <Icon className="simple-list-icon" icon={ check } size={ 24 } /> }
					<div className="simple-list-text">{ item }</div>
				</li>
			) ) }
		</ul>
	);
}
