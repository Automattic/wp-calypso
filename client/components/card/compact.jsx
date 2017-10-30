/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { assign } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';

export default function CompactCard( props ) {
	const nextProps = assign( {}, props, {
		className: classnames( props.className, 'is-compact' ),
	} );

	return <Card { ...nextProps }>{ props.children }</Card>;
}
