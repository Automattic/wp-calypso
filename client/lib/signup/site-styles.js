/** @format **/

// TODO: should this data come from an API endpoint, somehow related to verticals?
export const siteStyleOptions = {
	business: [
		{
			label: 'Modern',
			name: 'modern',
			value: 'pub/radcliffe-2',
		},
		{
			label: 'Pro',
			name: 'pro',
			value: 'pub/radcliffe-2-professional',
		},
		{
			label: 'Minimal',
			name: 'minimal',
			value: 'pub/radcliffe-2-minimal',
		},
		{
			label: 'Elegant',
			name: 'elegant',
			value: 'pub/radcliffe-2	-elegant',
		},
	],
};

export const getSiteStyleOptions = vertical =>
	siteStyleOptions[ vertical ] ? siteStyleOptions[ vertical ] : siteStyleOptions.business;
