/**
 * External dependencies
 */
import React, {
	AnchorHTMLAttributes,
	ButtonHTMLAttributes,
	DetailedHTMLProps,
	FunctionComponent,
} from 'react';
import classNames from 'classnames';

interface OwnProps {
	className?: string;
	compact?: boolean;
	block?: boolean;
	primary?: boolean;
	scary?: boolean;
	busy?: boolean;
	borderless?: boolean;
}

type AnchorProps = { href: string } & Exclude<
	DetailedHTMLProps< AnchorHTMLAttributes< HTMLAnchorElement >, HTMLAnchorElement >,
	'type'
>;

type ButtonProps = Exclude<
	DetailedHTMLProps< ButtonHTMLAttributes< HTMLButtonElement >, HTMLButtonElement >,
	'href'
>;

type Props = ( OwnProps & AnchorProps ) | ( OwnProps & ButtonProps );

function isAnchor( props: ButtonProps | AnchorProps ): props is AnchorProps {
	return !! ( props as AnchorProps ).href;
}

const Button: FunctionComponent< Props > = ( {
	className,
	compact,
	block,
	primary,
	scary,
	busy,
	borderless,
	...props
}: Props ) => {
	const buttonClass = classNames( 'button', className, {
		'is-compact': compact,
		'is-primary': primary,
		'is-scary': scary,
		'is-busy': busy,
		'is-block': block,
		'is-borderless': borderless,
	} );

	if ( isAnchor( props ) ) {
		// block referrers when external link
		const rel = props.target
			? ( props.rel || '' ).replace( /noopener|noreferrer/g, '' ) + ' noopener noreferrer'
			: props.rel;

		return <a { ...props } rel={ rel } className={ buttonClass } />;
	}

	return (
		<button
			{ ...props as ButtonProps }
			type={ props.type ? ( props as ButtonProps ).type : 'button' }
			className={ buttonClass }
		/>
	);
};

export default Button;
