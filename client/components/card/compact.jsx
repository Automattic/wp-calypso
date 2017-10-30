/** @format */
/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';

export default function CompactCard( props ) {
	return (
		<Card { ...props } className={ classnames( props.className, 'is-compact' ) }>
			{ props.children }
		</Card>
	);
}
