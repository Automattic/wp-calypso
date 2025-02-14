import clsx from 'clsx';
import { forwardRef } from 'react';
import type {
	Ref,
	ForwardRefRenderFunction,
	AnchorHTMLAttributes,
	ButtonHTMLAttributes,
} from 'react';
import type { NonUndefined } from 'utility-types';

import './style.scss';
export interface OwnProps {
	className?: string;
	compact?: boolean;
	primary?: boolean;
	scary?: boolean;
	busy?: boolean;
	borderless?: boolean;
	plain?: boolean;
	transparent?: boolean;
}

type AnchorElementProps = AnchorHTMLAttributes< HTMLAnchorElement >;

type AnchorProps = OwnProps &
	AnchorElementProps & {
		href: NonUndefined< AnchorElementProps[ 'href' ] >;
	};

export type ButtonProps = OwnProps & Omit< ButtonHTMLAttributes< HTMLButtonElement >, 'href' >;

const isAnchor = ( props: AnchorProps | ButtonProps ): props is AnchorProps =>
	!! ( props as AnchorProps ).href;

const cleanAnchorProps = ( {
	type,
	borderless,
	busy,
	className,
	compact,
	primary,
	scary,
	plain,
	transparent,
	...anchorProps
}: ButtonProps | AnchorProps ): AnchorProps => anchorProps as AnchorProps;

const cleanButtonProps = ( {
	type = 'button',
	borderless,
	busy,
	className,
	compact,
	primary,
	scary,
	plain,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore Clean incorrect usage of the component
	rel,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore Clean incorrect usage of the component
	href,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore Clean incorrect usage of the component
	target,
	transparent,
	...buttonProps
}: ButtonProps | AnchorProps ): ButtonProps => ( { ...buttonProps, type } ) as ButtonProps;

const UnforwardedButton: ForwardRefRenderFunction<
	HTMLButtonElement | HTMLAnchorElement,
	ButtonProps | AnchorProps
> = ( props, ref ) => {
	const classes = props.plain
		? clsx( 'button-plain', props.className )
		: clsx( 'button', props.className, {
				'is-compact': props.compact,
				'is-primary': props.primary,
				'is-scary': props.scary,
				'is-busy': props.busy,
				'is-borderless': props.borderless,
				'is-transparent': props.transparent,
		  } );

	if ( isAnchor( props ) ) {
		const anchorProps = cleanAnchorProps( props );
		// block referrers when external link
		const rel: string | undefined = anchorProps.target
			? ( anchorProps.rel || '' ).replace( /noopener|noreferrer/g, '' ) + ' noopener noreferrer'
			: anchorProps.rel;

		return (
			<a
				{ ...anchorProps }
				rel={ rel }
				className={ classes }
				ref={ ref as Ref< HTMLAnchorElement > }
			/>
		);
	}

	const buttonProps = cleanButtonProps( props );
	return (
		<button { ...buttonProps } className={ classes } ref={ ref as Ref< HTMLButtonElement > } />
	);
};
/**
 * @deprecated This button has been deprecated in favor of the `Button` component from `@wordpress/components`.
 * Please use the `Button` component from `@wordpress/components` instead. This button has aggressive and generic CSS that breaks many other buttons when imported.
 */
export const Button = forwardRef( UnforwardedButton );
