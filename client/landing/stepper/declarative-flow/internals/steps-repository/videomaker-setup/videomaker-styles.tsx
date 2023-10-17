import { StyleVariation } from '@automattic/design-picker';

export const VideoMakerStyleBlueYellow: StyleVariation = {
	slug: 'blue-yellow',
	title: 'Blue/Yellow',
	settings: {
		color: {
			palette: {
				theme: [
					{
						slug: 'foreground',
						color: '#FFFFFF',
						name: 'Foreground',
					},
					{
						slug: 'background',
						color: '#0C1525',
						name: 'Background',
					},
					{
						slug: 'primary',
						color: '#FFEBD9',
						name: 'Primary',
					},
					{
						slug: 'tertiary',
						color: '#1D283D',
						name: 'Tertiary',
					},
				],
			},
		},
	},
	styles: {
		color: {},
	},
};
