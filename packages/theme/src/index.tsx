import { forwardRef, useMemo } from 'react';
import { generateColors } from './color';
import { themeToCss } from './utils';

declare module 'react' {
	interface CSSProperties {
		[ key: `--${ string }` ]: string | number;
	}
}

type ThemeProps = {
	color: {
		primary: string;
		fun?: number;
		scheme?: 'dark' | 'light';
	};
	children?: React.ReactNode;
};

function useGenerateStyles( color: ThemeProps[ 'color' ] ): React.CSSProperties {
	const generatedTheme = useMemo(
		() =>
			themeToCss( {
				color: generateColors( {
					color: color.primary,
					fun: color.fun,
					isDark: color.scheme === 'dark',
				} ),
			} ),
		[ color.primary, color.fun, color.scheme ]
	);

	return generatedTheme;
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
