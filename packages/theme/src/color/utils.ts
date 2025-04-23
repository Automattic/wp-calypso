// map showing which lightness in scale each use case should use
// type ColorMap< T > = Partial<
// 	Record<
// 		'bg' | 'text' | 'border',
// 		Partial<
// 			Record<
// 				'default' | 'hover' | 'active' | 'input' | 'muted' | 'strong' | 'inverse' | 'disabled',
// 				T | Partial< Record< 'default' | 'disabled' | 'hover' | 'strong', T > >
// 			>
// 		>
// 	>
// >;

import type { TokensObject } from '../types';
import type { ArrayOf12, ColorMap } from './types';

// maps a color map to a color scale
export const mapColorsToScale = ( colorScale: ArrayOf12< string >, mapToObject: ColorMap ) => {
	const map: TokensObject = {};
	Object.entries( mapToObject ).forEach( ( [ alias, color ] ) => {
		map[ alias ] =
			typeof color === 'object' ? mapColorsToScale( colorScale, color ) : colorScale[ color ];
	} );
	return map;
};
