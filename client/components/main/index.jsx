/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

export default function Main( {
	className,
	children,
	wideLayout = false,
	maxWidthLayout = false
} ) {
	const classes = classNames( className, 'main', {
		'is-wide-layout': wideLayout,
		'max-width-layout': maxWidthLayout
	} );

	return (
		<main className={ classes } role="main">
			{ children }
		</main>
	);
}
