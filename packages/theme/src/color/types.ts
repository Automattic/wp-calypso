export type ArrayOf12< T > = [ T, T, T, T, T, T, T, T, T, T, T, T ];
export type ColorScaleIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type ColorMap = {
	[ key: string ]: ColorScaleIndex | ColorMap;
};
