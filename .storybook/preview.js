import './index.scss';

export const parameters = {
	layout: 'fullscreen',
	viewport: {
		/**
		 * These viewports are from Gutenberg.
		 * We can use this to set `parameters.viewport` in a story.
		 *
		 * @example
		 * export default {
		 *   title: 'sample',
		 *   component: Sample,
		 *   parameters: {
		 *     viewport: {
		 *       defaultViewport: 'SMALL',
		 *     },
		 *   },
		 * }
		 * @see https://github.com/WordPress/gutenberg/blob/db2f753977d1b5c28f1ff80b3fc32aa1d7a6a773/packages/base-styles/_breakpoints.scss#L6-L13
		 */
		viewports: {
			HUGE: {
				name: 'HUGE',
				styles: {
					width: '1440px',
					height: '100%',
				},
			},
			WIDE: {
				name: 'WIDE',
				styles: {
					width: '1280px',
					height: '100%',
				},
			},
			XLARGE: {
				name: 'XLARGE',
				styles: {
					width: '1080px',
					height: '100%',
				},
			},
			LARGE: {
				name: 'LARGE',
				styles: {
					width: '960px',
					height: '100%',
				},
			},
			MEDIUM: {
				name: 'MEDIUM',
				styles: {
					width: '782px',
					height: '100%',
				},
			},
			SMALL: {
				name: 'SMALL',
				styles: {
					width: '600px',
					height: '100%',
				},
			},
			MOBILE: {
				name: 'MOBILE',
				styles: {
					width: '480px',
					height: '100%',
				},
			},
			ZOOMED_IN: {
				name: 'ZOOMED_IN',
				styles: {
					width: '280px',
					height: '100%',
				},
			},
		},
	},
};
