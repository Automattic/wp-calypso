import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import { ReactNode } from 'react';
import './style.scss';

export default function SimpleList( {
	items,
	className,
	applyCoreStyles = false,
}: {
	items: ReactNode[];
	className?: string;
	applyCoreStyles?: boolean;
} ) {
	return (
		<ul
			className={ clsx( 'simple-list', className, {
				'is-core-styles': applyCoreStyles,
			} ) }
		>
			{ items.map( ( item, index ) => (
				<li key={ `item-${ index }` }>
					<Icon className="simple-list-icon" icon={ check } size={ 24 } />
					<div className="simple-list-text">{ item }</div>
				</li>
			) ) }
		</ul>
	);
}
