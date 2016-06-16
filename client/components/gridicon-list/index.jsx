/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */

export default function GridiconList( props ) {
	return (
		<ul { ...props } className={ classNames( 'gridicon-list', props.className ) }>
			{ props.children }
		</ul>
	);
}
