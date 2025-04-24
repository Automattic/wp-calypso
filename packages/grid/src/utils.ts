import { GridLayoutItem, NormalizedGridLayoutItem } from './types';

export function normalizeLayout( layout: GridLayoutItem[] ): NormalizedGridLayoutItem[] {
	const normalizedLayout = layout.map( ( item, index ) => {
		return {
			...item,
			order: item.order ?? index,
			width: item.width ?? 1,
			height: item.height ?? 1,
		};
	} );

	return normalizedLayout.sort( ( a, b ) => a.order - b.order );
}
