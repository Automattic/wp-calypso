/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

export default function GlobalNoticesContainer( { id, className, children } ) {
	return (
		<div id={ id } className={ classNames( 'global-notices', className ) }>
			{ children }
		</div>
	);
}
