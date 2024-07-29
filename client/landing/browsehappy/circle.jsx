import clsx from 'clsx';

import './circle.scss';

export default function Circle( { size = 'medium', color = 'gray', position = '1' } ) {
	const className = clsx( 'circle', `is-${ size }`, `is-${ color }`, `is-position-${ position }` );

	return <div className={ className } />;
}
