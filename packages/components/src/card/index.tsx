/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons'; // eslint-disable-line no-restricted-imports
import type { ElementType, ComponentProps, ReactNode, Ref } from 'react';

/**
 * Style dependencies
 */
import './style.scss';

export type TagName< P = any > = ElementType< P >; // eslint-disable-line @typescript-eslint/no-explicit-any

type OwnProps = {
	className?: string;
	displayAsLink?: boolean;
	href?: string;
	target?: string;
	compact?: boolean;
	highlight?: 'error' | 'info' | 'success' | 'warning';
};

type ElementProps< P, T extends TagName > = P &
	Omit< ComponentProps< T >, 'tagName' | keyof P > & {
		tagName?: T | keyof JSX.IntrinsicElements;
		children?: ReactNode;
	};

export type Props< T extends TagName > = ElementProps< OwnProps, T >;

const Card = < T extends TagName = 'div' >(
	{
		children,
		className,
		compact,
		displayAsLink,
		highlight,
		tagName = 'div',
		href,
		target,
		...props
	}: Props< T >,
	forwardedRef: Ref< any > // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
	const elementClass = classNames(
		'card',
		className,
		{
			'is-card-link': displayAsLink || href,
			'is-clickable': props.onClick,
			'is-compact': compact,
			'is-highlight': highlight,
		},
		highlight ? 'is-' + highlight : false
	);

	return href ? (
		<a { ...props } href={ href } target={ target } className={ elementClass } ref={ forwardedRef }>
			<Gridicon className="card__link-indicator" icon={ target ? 'external' : 'chevron-right' } />
			{ children }
		</a>
	) : (
		React.createElement(
			tagName,
			{ ...props, className: elementClass, ref: forwardedRef },
			displayAsLink && (
				<Gridicon className="card__link-indicator" icon={ target ? 'external' : 'chevron-right' } />
			),
			children
		)
	);
};

const ForwardedRefCard = React.forwardRef( Card );
ForwardedRefCard.displayName = 'Card';

export default React.memo( ForwardedRefCard );
