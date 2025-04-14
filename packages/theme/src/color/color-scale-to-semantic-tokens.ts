// map showing which lightness in scale each use case should use
// type ColorPalette< T > = Partial<
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

export type ColorPalette< T > = {
	[ key: string ]: T | ColorPalette< T >;
};

const COLOR_MAP: ColorPalette< number > = {
	bg: {
		default: 2,
		hover: 3,
		active: 4,
		input: {
			default: 0,
			disabled: 0,
		},
		muted: 1,
		strong: {
			default: 8,
			hover: 9,
		},
	},
	text: {
		default: 10,
		hover: 11,
		strong: 11,
		inverse: {
			default: 1,
			strong: 0,
		},
		muted: 9,
	},
	border: {
		default: 5,
		disabled: 4,
		input: 6,
		strong: {
			default: 6,
			hover: 7,
		},
		muted: 4,
		hover: 6,
	},
};

// maps a color map to a color palette
export const mapColors = (
	mapFromArray: string[],
	mapToObject: ColorPalette< number > = COLOR_MAP
) => {
	const map: ColorPalette< string > = {};
	Object.entries( mapToObject ).forEach( ( [ alias, color ] ) => {
		map[ alias ] =
			typeof color === 'object' ? mapColors( mapFromArray, color ) : mapFromArray[ color ];
	} );
	return map;
};
