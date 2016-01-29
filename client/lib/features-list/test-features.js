/**
 * A list of features to a/b test on the `Plans` component.
 * NOTE: If this test variation becomes the default, these will need to
 * be translated and returned by the API.
 */
const features = {
	free_plan: [
		{
			text: 'A WordPress.com Site loaded with powerful features',
			planSpecific: false
		},
		{
			text: '3GB Storage Space',
			planSpecific: false
		},
		{
			text: 'Support from the WordPress.com community',
			planSpecific: false
		},
	],
	value_bundle: [
		{
			text: 'A WordPress.com Site',
			planSpecific: false
		},
		{
			text: '13GB Storage Space',
			planSpecific: true
		},
		{
			text: 'Custom Site Address',
			planSpecific: true
		},
		{
			text: 'No Ads',
			planSpecific: true
		},
		{
			text: 'Custom Design',
			planSpecific: true
		},
		{
			text: 'Video Hosting & Storage',
			planSpecific: true
		},
		{
			text: 'Direct Email Support',
			planSpecific: true
		},
	],
	'business-bundle': [
		{
			text: 'A WordPress.com Site',
			planSpecific: false
		},
		{
			text: 'Unlimited Storage Space',
			planSpecific: true
		},
		{
			text: 'Custom Site Address',
			planSpecific: false
		},
		{
			text: 'No Ads',
			planSpecific: false
		},
		{
			text: 'Custom Design',
			planSpecific: false
		},
		{
			text: 'Video Hosting & Storage',
			planSpecific: false
		},
		{
			text: 'eCommerce',
			planSpecific: true
		},
		{
			text: 'Unlimited Premium Themes',
			planSpecific: true
		},
		{
			text: 'Google Analytics',
			planSpecific: true
		},
		{
			text: 'Live Chat Support',
			planSpecific: true
		},
	]
};

export default features;
