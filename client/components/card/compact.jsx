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

export default function CompactCard( { className, ...props } ) {
	return <Card { ...props } className={ classnames( className, 'is-compact' ) } />;
}
