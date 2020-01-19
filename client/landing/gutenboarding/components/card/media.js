/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { MediaUI } from './styles/card-styles';

export function CardMedia( props ) {
	const { className, ...additionalProps } = props;

	const classes = classnames( 'components-card__media', className );

	return <MediaUI { ...additionalProps } className={ classes } />;
}

export default CardMedia;
