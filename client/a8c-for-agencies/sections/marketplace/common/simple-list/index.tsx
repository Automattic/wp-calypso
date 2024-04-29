import { Icon, check } from '@wordpress/icons';
import { ReactNode } from 'react';

import './style.scss';

export default function SimpleList( { items }: { items: ReactNode[] } ) {
	return (
		<ul className="simple-list">
			{ items.map( ( item, index ) => (
				<li key={ `item-${ index }` }>
					<Icon className="simple-list-icon" icon={ check } size={ 24 } />
					{ item }
				</li>
			) ) }
		</ul>
	);
}
