export type ArrayOf12< T > = [ T, T, T, T, T, T, T, T, T, T, T, T ];
export type ColorScaleIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type ColorMap = {
	[ key: string ]: ColorScaleIndex | ColorMap;
};

// TODO: define token map (pressed, inverse?)
// type Element = 'text' | 'stroke' | 'icon' | 'background';
// // type Tone = 'neutral' | 'error' | 'warning' | 'success' | 'info';
// type Emphasis = 'strong' | 'neutral' | 'weak';
// type State = 'hover' | 'active' | 'focus' | 'disabled' | 'selected';

// export type ColorMapSpec = {
// 	[ key in Element ]: {
// 		// [ key in Tone ]: {
// 		[ key in Emphasis ]:
// 			| ColorScaleIndex
// 			| {
// 					[ key in State ]: ColorScaleIndex;
// 			  };
// 		// };
// 	};
// };
