/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

export default function Main( {
	className,
	children,
	wideLayout = false,
	fullWidthLayout = false,
} ) {
	const classes = classNames( className, 'main', {
		'is-wide-layout': wideLayout,
		'is-full-width-layout': fullWidthLayout,
	} );

	return (
		<main className={ classes } role="main">
			{ children }
		</main>
	);
}
