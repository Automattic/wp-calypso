import { ColorMap } from './types';

export const COLOR_MAP: ColorMap = {
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
