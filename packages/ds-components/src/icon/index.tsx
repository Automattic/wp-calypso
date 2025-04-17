/**
 * WordPress dependencies
 */
import { cloneElement, createElement, isValidElement } from '@wordpress/element';
import { SVG } from '@wordpress/primitives';
import type { ComponentType } from 'react';

export type IconType =
	| ComponentType< { size?: number } >
	| ( ( props: { size?: number } ) => JSX.Element )
	| JSX.Element;

type AdditionalProps< T > = T extends ComponentType< infer U > ? U : Record< string, never >;

export type Props = {
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
	/**
	 * Additional class name to apply to the icon.
	 */
	className?: string;
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
			// @ts-expect-error Just forwarding the size prop along
			size,
			...additionalProps,
		} );
	}

	return icon;
}

export default Icon;
