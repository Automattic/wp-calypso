/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import Gridicon from 'gridicons'; // eslint-disable-line no-restricted-imports

/**
 * Style dependencies
 */
import './style.scss';

type TagName< P = any > = React.ElementType< P >; // eslint-disable-line @typescript-eslint/no-explicit-any

type OwnProps = {
	className?: string;
	displayAsLink?: boolean;
	href?: string;
	target?: string;
	compact?: boolean;
	highlight?: 'error' | 'info' | 'success' | 'warning';
};

type Props< P, T extends TagName > = P &
	Omit< React.ComponentProps< T >, 'tagName' | keyof P > & {
		tagName?: T | keyof JSX.IntrinsicElements;
		children?: React.ReactNode;
	};

const Card = < T extends TagName = 'div' >( props: Props< OwnProps, T > ): JSX.Element => {
	const {
		children,
		className,
		compact,
		displayAsLink,
		highlight,
		tagName = 'div',
		href,
		target,
		...otherProps
	} = props;

	const elementClass = classnames(
		'card',
		className,
		{
			'is-card-link': displayAsLink || href,
			'is-clickable': otherProps.onClick,
			'is-compact': compact,
			'is-highlight': highlight,
		},
		highlight ? 'is-' + highlight : false
	);

	return href ? (
		<a { ...otherProps } href={ href } target={ target } className={ elementClass }>
			<Gridicon className="card__link-indicator" icon={ target ? 'external' : 'chevron-right' } />
			{ children }
		</a>
	) : (
		React.createElement(
			tagName,
			{
				...otherProps,
				className: elementClass,
			},
			<>
				{ displayAsLink && (
					<Gridicon
						className="card__link-indicator"
						icon={ target ? 'external' : 'chevron-right' }
					/>
				) }
				{ children }
			</>
		)
	);
};

export default React.memo( Card ) as typeof Card;
