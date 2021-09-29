import classNames from 'classnames';

import './circle.scss';

export default function Circle( { size = 'medium', color = 'gray', position = '1' } ) {
	const className = classNames(
		'circle',
		`is-${ size }`,
		`is-${ color }`,
		`is-position-${ position }`
	);

	return <div className={ className } />;
}
