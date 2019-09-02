/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import classNames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';
import { NonUndefined } from 'utility-types';

interface Props {
	className?: string;
	compact?: boolean;
	primary?: boolean;
	scary?: boolean;
	busy?: boolean;
	borderless?: boolean;
}

type AProps = Props &
	React.AnchorHTMLAttributes< HTMLAnchorElement > & {
		href: NonUndefined< React.AnchorHTMLAttributes< HTMLAnchorElement >['href'] >;
	};
type ButtonProps = Props & Omit< React.ButtonHTMLAttributes< HTMLButtonElement >, 'href' >;

const isAnchor = ( props: AProps | ButtonProps ): props is AProps => !! ( props as AProps ).href;

const Button: FunctionComponent< ButtonProps | AProps > = ( {
	borderless,
	busy,
	className: classProp,
	compact,
	primary,
	scary,
	...props
} ) => {
	const className = classNames( 'button', classProp, {
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
	return <button { ...props as ButtonProps } type={ type } className={ className } />;
};

export default Button;
