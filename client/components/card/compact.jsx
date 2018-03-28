/** @format */
/**
 * External dependencies
 */
import React from 'react';
/**
 * Internal dependencies
 */
import Card from 'components/card';

export default function CompactCard( props ) {
	return (
		<Card { ...props } className={ props.className }>
			{ props.children }
		</Card>
	);
}
