import classNames from 'classnames';

import './style.scss';

export default function Main( {
	className = '',
	id = '',
	children,
	wideLayout = false,
	fullWidthLayout = false,
	isRedesign = false,
} ) {
	const classes = classNames( className, 'main', {
		'is-wide-layout': wideLayout,
		'is-full-width-layout': fullWidthLayout,
		'is-redesign': isRedesign,
	} );

	return (
		<main className={ classes } id={ id || null } role="main">
			{ children }
		</main>
	);
}
