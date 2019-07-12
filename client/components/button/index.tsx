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

type AnchorProps = { href: string } & DetailedHTMLProps<
	AnchorHTMLAttributes< HTMLAnchorElement >,
	HTMLAnchorElement
>;

type ButtonProps = DetailedHTMLProps<
	ButtonHTMLAttributes< HTMLButtonElement >,
	HTMLButtonElement
>;

type Props = Exclude< OwnProps & AnchorProps, 'type' > | Exclude< OwnProps & ButtonProps, 'href' >;

function isButton( props: ButtonProps | AnchorProps ): props is ButtonProps {
	return ! ( props as AnchorProps ).href;
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

	if ( isButton( props ) ) {
		return (
			<button { ...props } type={ props.type ? props.type : 'button' } className={ buttonClass } />
		);
	}
	// block referrers when external link
	const rel = props.target
		? ( props.rel || '' ).replace( /noopener|noreferrer/g, '' ) + ' noopener noreferrer'
		: props.rel;

	return <a { ...props } rel={ rel } className={ buttonClass } />;
};

export default Button;
