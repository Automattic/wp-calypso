import { Design } from '../../../types';

export const premiumDesign: Design = {
	slug: 'annalee',
	title: 'Annalee',
	description: 'Annalee is a theme perfect for a persoanl coach.',
	recipe: {
		stylesheet: 'premium/annalee',
	},
	categories: [
		{
			slug: 'business',
			name: 'Business',
		},
		{
			slug: 'education',
			name: 'Education',
		},
		{
			slug: 'health-wellness',
			name: 'Health & Wellness',
		},
	],
	is_premium: true,
	is_externally_managed: false,
	is_bundled_with_woo: false,
	price: '€55',
	software_sets: [],
	design_type: 'premium',
	style_variations: [],
	is_virtual: false,
	theme: '',
	screenshot: 'https://i0.wp.com/s2.wp.com/wp-content/themes/premium/annalee/screenshot.png?ssl=1',
};
