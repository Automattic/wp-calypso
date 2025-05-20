/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { cloneElement, createElement, isValidElement } from '@wordpress/element';
import { SVG } from '@wordpress/primitives';

/**
 * Internal dependencies
 */
import Dashicon from '../dashicon';
import type { IconKey as DashiconIconKey } from '../dashicon/types';
import type { ComponentType, HTMLProps, SVGProps } from 'react';

export type IconType =
	| DashiconIconKey
	| ComponentType< { size?: number } >
	| ( ( props: { size?: number } ) => JSX.Element )
	| JSX.Element;

type AdditionalProps< T > = T extends ComponentType< infer U >
	? U
	: T extends DashiconIconKey
	? SVGProps< SVGSVGElement >
	: {};

export type Props = {
	/**
	 * The icon to render. In most cases, you should use an icon from
	 * [the `@wordpress/icons` package](https://wordpress.github.io/gutenberg/?path=/story/icons-icon--library).
	 *
	 * Other supported values are: component instances, functions,
	 * [Dashicons](https://developer.wordpress.org/resource/dashicons/)
	 * (specified as strings), and `null`.
	 *
	 * The `size` value, as well as any other additional props, will be passed through.
	 * @default null
	 */
	icon?: IconType | null;
	/**
	 * The size (width and height) of the icon.
	 *
	 * Defaults to `20` when `icon` is a string (i.e. a Dashicon id), otherwise `24`.
	 * @default `'string' === typeof icon ? 20 : 24`.
	 */
	size?: number;
} & AdditionalProps< IconType >;

/**
 * Renders a raw icon without any initial styling or wrappers.
 *
 * ```jsx
 * import { wordpress } from '@wordpress/icons';
 *
 * <Icon icon={ wordpress } />
 * ```
 */
function Icon( {
	icon = null,
	size = 'string' === typeof icon ? 20 : 24,
	...additionalProps
}: Props ) {
	if ( 'string' === typeof icon ) {
		return (
			<Dashicon
				icon={ icon }
				size={ size }
				{ ...( additionalProps as HTMLProps< HTMLSpanElement > ) }
			/>
		);
	}

	if ( isValidElement( icon ) && Dashicon === icon.type ) {
		return cloneElement( icon, {
			...additionalProps,
		} );
	}

	if ( 'function' === typeof icon ) {
		return createElement( icon, {
			size,
			...additionalProps,
		} );
	}

	if ( icon && ( icon.type === 'svg' || icon.type === SVG ) ) {
		const appliedProps = {
			...icon.props,
			width: size,
			height: size,
			...additionalProps,
		};

		return <SVG { ...appliedProps } />;
	}

	if ( isValidElement( icon ) ) {
		return cloneElement( icon, {
			// @ts-ignore Just forwarding the size prop along
			size,
			...additionalProps,
		} );
	}

	return icon;
}

export default Icon;
