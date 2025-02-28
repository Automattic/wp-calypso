import './index.scss';

export const parameters = {
	controls: {
		sort: 'requiredFirst',
	},
	docs: {
		controls: {
			sort: 'requiredFirst',
		},
	},
	layout: 'fullscreen',
	viewport: {
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
