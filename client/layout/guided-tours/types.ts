export type ArrowPosition =
	| 'bottom-center'
	| 'bottom-left'
	| 'bottom-right'
	| 'left-bottom'
	| 'left-middle'
	| 'left-top'
	| 'right-bottom'
	| 'right-middle'
	| 'right-top'
	| 'top-center'
	| 'top-left'
	| 'top-right';

export type DialogPosition = 'above' | 'below' | 'beside' | 'left' | 'center' | 'middle' | 'right';

export interface Coordinate {
	x: number;
	y: number;
}
