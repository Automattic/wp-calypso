/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

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

