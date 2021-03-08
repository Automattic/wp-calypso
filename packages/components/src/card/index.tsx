/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons'; // eslint-disable-line no-restricted-imports
import type { ElementType, ComponentProps, ReactNode } from 'react';

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

class Card< T extends TagName = 'div' > extends PureComponent< Props< T > > {
	render(): JSX.Element {
		const {
			children,
			className,
			compact,
			displayAsLink,
			highlight,
			tagName = 'div',
			href,
			target,
			...props
		} = this.props;

		const elementClass = classNames(
			'card',
			className,
			{
				'is-card-link': displayAsLink || href,
				'is-clickable': this.props.onClick,
				'is-compact': compact,
				'is-highlight': highlight,
			},
			highlight ? 'is-' + highlight : false
		);

		return href ? (
			<a { ...props } href={ href } target={ target } className={ elementClass }>
				<Gridicon className="card__link-indicator" icon={ target ? 'external' : 'chevron-right' } />
				{ children }
			</a>
		) : (
			React.createElement(
				tagName,
				{ ...props, className: elementClass },
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
	}
}

export default Card;
