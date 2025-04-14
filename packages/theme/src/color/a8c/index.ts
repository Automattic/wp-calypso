// import { useMemo } from 'react';
// import { themeToCss } from '../utils';
// import { generateColors } from './color';
// import type { ThemeProps } from '../../types';

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
