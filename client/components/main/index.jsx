/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';

export default function Main( {
	className,
	children,
	wideLayout = false
} ) {
	const classes = classNames( className, 'main', {
		'is-wide-layout': wideLayout
	} );

	return (
		<main className={ classes } role="main">
			{ children }
		</main>
	);
}
