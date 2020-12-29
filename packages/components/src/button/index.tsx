/**
 * External dependencies
 */
import React from 'react';
import type { FunctionComponent, AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import classnames from 'classnames';
import type { NonUndefined } from 'utility-types';

/**
 * Style dependencies
 */
import './style.scss';
interface OwnProps {
	className?: string;
	compact?: boolean;
	primary?: boolean;
	scary?: boolean;
	busy?: boolean;
	borderless?: boolean;
}

type AnchorElementProps = AnchorHTMLAttributes< HTMLAnchorElement >;

type AnchorProps = OwnProps &
	AnchorElementProps & {
		href: NonUndefined< AnchorElementProps[ 'href' ] >;
	};

type ButtonProps = OwnProps & Omit< ButtonHTMLAttributes< HTMLButtonElement >, 'href' >;

const isAnchor = ( props: AnchorProps | ButtonProps ): props is AnchorProps =>
	!! ( props as AnchorProps ).href;

const Button: FunctionComponent< ButtonProps | AnchorProps > = ( {
	borderless,
	busy,
	className: classProp,
	compact,
	primary,
	scary,
	...props
} ) => {
	const className = classnames( 'button', classProp, {
		'is-compact': compact,
		'is-primary': primary,
		'is-scary': scary,
		'is-busy': busy,
		'is-borderless': borderless,
	} );

	if ( isAnchor( props ) ) {
		// block referrers when external link
		const rel: string | undefined = props.target
			? ( props.rel || '' ).replace( /noopener|noreferrer/g, '' ) + ' noopener noreferrer'
			: props.rel;

		return <a { ...props } rel={ rel } className={ className } />;
	}

	const { type = 'button' } = props as ButtonProps;
	return <button { ...( props as ButtonProps ) } type={ type } className={ className } />;
};

export default Button;
