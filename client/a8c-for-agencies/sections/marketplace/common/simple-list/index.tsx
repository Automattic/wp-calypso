import { Icon, check } from '@wordpress/icons';
import classNames from 'classnames';
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
		<ul className={ classNames( 'simple-list', className ) }>
			{ items.map( ( item, index ) => (
				<li key={ `item-${ index }` }>
					<Icon className="simple-list-icon" icon={ check } size={ 24 } />
					<div className="simple-list-text">{ item }</div>
				</li>
			) ) }
		</ul>
	);
}
