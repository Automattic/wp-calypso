/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { DividerUI } from './styles/card-styles';

export function CardDivider( props ) {
	const { className, ...additionalProps } = props;

	const classes = classnames( 'components-card__divider', className );

	return (
		<DividerUI { ...additionalProps } children={ null } className={ classes } role="separator" />
	);
}

export default CardDivider;
