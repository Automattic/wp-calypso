import { forwardRef } from 'react';
import { useGenerateStyles } from './color/a8c';
import type { ThemeProps } from './types';

declare module 'react' {
	interface CSSProperties {
		[ key: `--${ string }` ]: string | number;
	}
}

const Theme = forwardRef< HTMLDivElement, ThemeProps >( function Theme( { color, children }, ref ) {
	const styles = useGenerateStyles( color );

	return (
		<div ref={ ref } style={ styles }>
			{ children }
		</div>
	);
} );

export { Theme };
