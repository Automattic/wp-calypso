import { forwardRef } from 'react';
import { useGenerateStyles } from './color/a8c';
import { useGenerateRadixStyles } from './color/radix';
import type { ThemeProps } from './types';

declare module 'react' {
	interface CSSProperties {
		[ key: `--${ string }` ]: string | number;
	}
}

const Theme = forwardRef< HTMLDivElement, ThemeProps >( function Theme( { color, children }, ref ) {
	const styles = useGenerateStyles( color );
	const radixColors = useGenerateRadixStyles( color );

	return (
		<div ref={ ref } style={ { ...styles, ...radixColors } }>
			{ children }
		</div>
	);
} );

export { Theme };
