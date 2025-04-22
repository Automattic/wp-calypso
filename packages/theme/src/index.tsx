import { forwardRef } from 'react';
import { generateColors } from './color';
import { themeToCss } from './utils';
import type { ThemeProps } from './types';

declare module 'react' {
	interface CSSProperties {
		[ key: `--${ string }` ]: string | number;
	}
}

const Theme = forwardRef< HTMLDivElement, ThemeProps >( function Theme( { color, children }, ref ) {
	const themeCss = themeToCss( { color: generateColors( color ) } );

	return (
		<div ref={ ref } style={ themeCss }>
			{ children }
		</div>
	);
} );

export { Theme };
