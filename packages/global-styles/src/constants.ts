import type { GlobalStylesObject } from './types';

export const STYLE_PREVIEW_WIDTH = 248;
export const STYLE_PREVIEW_HEIGHT = 152;
export const STYLE_PREVIEW_COLOR_SWATCH_SIZE = 32;

export const COLOR_PALETTE_VARIATIONS: GlobalStylesObject[] = [
	{
		settings: {
			color: {
				palette: {
					theme: [
						{
							color: '#1B1031',
							name: 'Background',
							slug: 'background',
						},
						{
							color: '#FFFFFF',
							name: 'Foreground',
							slug: 'foreground',
						},
						{
							color: '#FF746D',
							name: 'Primary',
							slug: 'primary',
						},
						{
							color: '#551C5E',
							name: 'Secondary',
							slug: 'secondary',
						},
						{
							color: '#FB326B',
							name: 'Tertiary',
							slug: 'tertiary',
						},
					],
				},
			},
		},
		styles: {},
	},
	{
		settings: {
			color: {
				palette: {
					theme: [
						{
							color: '#ff5252',
							name: 'Background',
							slug: 'background',
						},
						{
							color: '#252525',
							name: 'Foreground',
							slug: 'foreground',
						},
						{
							color: '#ffffff',
							name: 'Primary',
							slug: 'primary',
						},
						{
							color: '#ff2d34',
							name: 'Secondary',
							slug: 'secondary',
						},
						{
							color: '#ff7e7e',
							name: 'Tertiary',
							slug: 'tertiary',
						},
					],
				},
			},
		},
		styles: {},
	},
	{
		settings: {
			color: {
				palette: {
					theme: [
						{
							color: '#fdff85',
							name: 'Background',
							slug: 'background',
						},
						{
							color: '#000000',
							name: 'Foreground',
							slug: 'foreground',
						},
						{
							color: '#000000',
							name: 'Primary',
							slug: 'primary',
						},
						{
							color: '#353535',
							name: 'Secondary',
							slug: 'secondary',
						},
						{
							color: '#ffffff',
							name: 'Tertiary',
							slug: 'tertiary',
						},
					],
				},
			},
		},
		styles: {},
	},
	{
		settings: {
			color: {
				palette: {
					theme: [
						{
							color: '#f3f3f1',
							name: 'Background',
							slug: 'background',
						},
						{
							color: '#2500ff',
							name: 'Foreground',
							slug: 'foreground',
						},
						{
							color: '#f3f3f1',
							name: 'Primary',
							slug: 'primary',
						},
						{
							color: '#2500ff',
							name: 'Secondary',
							slug: 'secondary',
						},
						{
							color: '#f6f6f6',
							name: 'Tertiary',
							slug: 'tertiary',
						},
					],
				},
			},
		},
		styles: {},
	},
	{
		settings: {
			color: {
				palette: {
					theme: [
						{
							color: '#E1E1C7',
							name: 'Background',
							slug: 'background',
						},
						{
							color: '#000000',
							name: 'Foreground',
							slug: 'foreground',
						},
						{
							color: '#214F31',
							name: 'Primary',
							slug: 'primary',
						},
						{
							color: '#000000',
							name: 'Secondary',
							slug: 'secondary',
						},
						{
							color: '#F0EBD2',
							name: 'Tertiary',
							slug: 'tertiary',
						},
					],
				},
			},
		},
		styles: {},
	},
];

export const FONT_PAIRING_VARIATIONS: GlobalStylesObject[] = [
	{
		settings: {},
		styles: {
			elements: {
				heading: {
					typography: {
						fontFamily: 'Cabin',
					},
				},
			},
			typography: {
				fontFamily: 'Raleway',
			},
		},
	},
	{
		settings: {},
		styles: {
			elements: {
				heading: {
					typography: {
						fontFamily: 'Chivo',
					},
				},
			},
			typography: {
				fontFamily: 'Open Sans',
			},
		},
	},
	{
		settings: {},
		styles: {
			elements: {
				heading: {
					typography: {
						fontFamily: 'Playfair Display',
					},
				},
			},
			typography: {
				fontFamily: 'Fira Sans',
			},
		},
	},
	{
		settings: {},
		styles: {
			elements: {
				heading: {
					typography: {
						fontFamily: 'Arvo',
					},
				},
			},
			typography: {
				fontFamily: 'Montserrat',
			},
		},
	},
	{
		settings: {},
		styles: {
			elements: {
				heading: {
					typography: {
						fontFamily: 'Space Mono',
					},
				},
			},
			typography: {
				fontFamily: 'Roboto',
			},
		},
	},
];
