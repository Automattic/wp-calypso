/**
 * Forked from `@wordpress/components`
 *
 * Only forked for CSS collision safety, in case styles or classnames are added upstream.
 *
 * - Removed Gridicons support (non-critical).
 */

import { cloneElement, createElement, isValidElement } from '@wordpress/element';
import { SVG } from '@wordpress/primitives';
import type { ComponentType } from 'react';

type IconType =
	| ComponentType< { size?: number } >
	| ( ( props: { size?: number } ) => JSX.Element )
	| JSX.Element;

type AdditionalProps< T > = T extends ComponentType< infer U > ? U : Record< string, unknown >;

type Props = {
	/**
	 * The icon to render. In most cases, you should use an icon from
	 * [the `@wordpress/icons` package](https://wordpress.github.io/gutenberg/?path=/story/icons-icon--library).
	 *
	 * Other supported values are: component instances, functions, and `null`.
	 *
	 * The `size` value, as well as any other additional props, will be passed through.
	 * @default null
	 */
	icon?: IconType | null;
	/**
	 * The size (width and height) of the icon.
	 * @default 24
	 */
	size?: number;
} & AdditionalProps< IconType >;

/**
 * Renders a raw icon without any initial styling or wrappers.
 *
 * ```jsx
 * import { Icon } from '@automattic/ui';
 * import { wordpress } from '@wordpress/icons';
 *
 * <Icon icon={ wordpress } />
 * ```
 */
export function Icon( { icon = null, size = 24, ...additionalProps }: Props ) {
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
