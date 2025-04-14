// export function useGenerateStyles( color: ThemeProps[ 'color' ] ): React.CSSProperties {
// 	const generatedTheme = useMemo(
// 		() =>
// 			themeToCss( {
// 				color: generateColors( {
// 					color: color.primary,
// 					fun: color.fun,
// 					isDark: color.scheme === 'dark',
// 				} ),
// 			} ),
// 		[ color.primary, color.fun, color.scheme ]
// 	);

// 	return generatedTheme;
// }
import { ThemeProps } from '../types';
import { generateBaseTokens as generateA8CBaseTokens } from './a8c/color';
import { mapColors } from './color-scale-to-semantic-tokens';
import { generateBaseTokens as generateRadixBaseTokens } from './radix';

export function generateColors( color: ThemeProps[ 'color' ] ) {
	const a8cBaseTokens = generateA8CBaseTokens( color );
	const radixBaseTokens = generateRadixBaseTokens( color );

	const a8cTokens = {
		...a8cBaseTokens,
		neutral: mapColors( a8cBaseTokens[ 'neutral-scale' ] ),
		primary: mapColors( a8cBaseTokens[ 'primary-scale' ] ),
	};

	const radixTokens = {
		...radixBaseTokens,
		neutral: mapColors( radixBaseTokens[ 'neutral-scale' ] ),
		primary: mapColors( radixBaseTokens[ 'primary-scale' ] ),
	};

	return {
		a8c: a8cTokens,
		radix: radixTokens,
	};
}
