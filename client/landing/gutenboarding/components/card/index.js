/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { CardContext } from './context';
import { CardUI } from './styles/card-styles';

export const defaultProps = {
	isBorderless: false,
	isElevated: false,
	size: 'medium',
};

export function Card( props ) {
	const { className, isBorderless, isElevated, size, ...additionalProps } = props;
	const { Provider } = CardContext;

	const contextProps = {
		isBorderless,
		isElevated,
		size,
	};

	const classes = classnames(
		'components-card',
		isBorderless && 'is-borderless',
		isElevated && 'is-elevated',
		size && `is-size-${ size }`,
		className
	);

	return (
		<Provider value={ contextProps }>
			<CardUI { ...additionalProps } className={ classes } />
		</Provider>
	);
}

Card.defaultProps = defaultProps;

export default Card;
