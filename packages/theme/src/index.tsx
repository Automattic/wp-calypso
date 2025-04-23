import { forwardRef, useMemo } from 'react';
import { generateColors } from './color';
import { themeToCss } from './utils';
import type { ThemeProps } from './types';

declare module 'react' {
	interface CSSProperties {
		[ key: `--${ string }` ]: string | number;
	}
}

const Theme = forwardRef< HTMLDivElement, ThemeProps >( function Theme( { color, children }, ref ) {
	const { primary, info, success, warning, error, fun, scheme } = color;
	const colorTokens = useMemo(
		// Recalculate the color tokens only when necessary.
		() => generateColors( { primary, info, success, warning, error, scheme, fun } ),
		[ primary, info, success, warning, error, scheme, fun ]
	);

	const themeCss = themeToCss( { color: colorTokens } );

	return (
		<div ref={ ref } style={ themeCss }>
			{ children }
		</div>
	);
} );

export { Theme };
