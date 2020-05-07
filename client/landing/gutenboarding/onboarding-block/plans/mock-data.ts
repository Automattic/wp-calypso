export type PlanFeature = { name: string; type: string; data: Array< boolean | string > };

export type PlanDetail = { id: string; name: string | null; features: Array< PlanFeature > };

export type PlanDetails = Array< PlanDetail >;

export type Plan = {
	id: string;
	name: string;
	price: string;
	features: Array< string >;
	isPopular?: boolean;
	isSelected?: boolean;
	domainName?: string;
};

export type Plans = Array< Plan >;

const mainFeatures = [
	'Remove WordPress ads',
	'Email & basic Live Chat Support',
	'Collect recurring payments',
	'Collect one-time payments',
	'Earn ad revenue',
	'Premium themes',
	'Upload videos',
	'Google Analytics support',
	'Business features (incl. SEO)',
	'Accept Payments in 60+ Countries',
];

export const plans: Plans = [
	{
		id: 'free',
		name: 'Free',
		price: '$0',
		features: [ '3 GB', ...mainFeatures.slice( 0, 1 ) ],
		domainName: 'roastingbeans.wordpress.com',
	},
	{
		id: 'personal',
		name: 'Personal',
		price: '$5',
		features: [ '6 GB', ...mainFeatures.slice( 0, 4 ) ],
		isSelected: true,
	},
	{
		id: 'premium',
		name: 'Premium',
		price: '$8',
		features: [ '13 GB', ...mainFeatures.slice( 0, 9 ) ],
		isPopular: true,
	},
	{
		id: 'business',
		name: 'Business',
		price: '$25',
		features: [ '200 GB', ...mainFeatures.slice( 0, 10 ) ],
	},
	{
		id: 'commerce',
		name: 'Commerce',
		price: '$45',
		features: [ '200 GB', ...mainFeatures.slice( 0, 11 ) ],
	},
];

export const details: PlanDetails = [
	{
		id: 'general',
		name: null,
		features: [
			{
				name: 'Free domain for One Year',
				type: 'checkbox',
				data: [ false, true, true, true, true ],
			},
			{
				name: '24/7 Email and live chat support',
				type: 'checkbox',
				data: [ false, true, true, true, true ],
			},
			{
				name: 'Preinstalled SSL security',
				type: 'checkbox',
				data: [ false, true, true, true, true ],
			},
			{
				name: 'Jetpack essential features',
				type: 'checkbox',
				data: [ false, true, true, true, true ],
			},
			{
				name: 'Storage',
				type: 'text',
				data: [ '3 GB', '6 GB', '13 GB', '200 GB', '200 GB' ],
			},
			{
				name: 'Dozens of free designs',
				type: 'checkbox',
				data: [ true, true, true, true, true ],
			},
			{
				name: 'Remove Wordpress.com ads',
				type: 'checkbox',
				data: [ true, true, true, true, true ],
			},
			{
				name: 'Unlimited premium themes',
				type: 'checkbox',
				data: [ true, true, true, true, true ],
			},
			{
				name: 'Advanced design customization',
				type: 'checkbox',
				data: [ true, true, true, true, true ],
			},
			{
				name: 'Get personalized help',
				type: 'checkbox',
				data: [ true, true, true, true, true ],
			},
			{
				name: 'Install plugins',
				type: 'checkbox',
				data: [ true, true, true, true, true ],
			},
			{
				name: 'Upload themesRemove WordPress.com branding',
				type: 'checkbox',
				data: [ true, true, true, true, true ],
			},
			{
				name: 'Automated backup & one-click rewind',
				type: 'checkbox',
				data: [ true, true, true, true, true ],
			},
			{
				name: 'SFTP and database access',
				type: 'checkbox',
				data: [ true, true, true, true, true ],
			},
		],
	},
	{
		id: 'commerce',
		name: 'Commerce',
		features: [
			{
				name: 'Sell subscriptions (recurring payments)',
				type: 'checkbox',
				data: [ true, true, true, true, true ],
			},
			{
				name: 'Sell single items (simple payments',
				type: 'checkbox',
				data: [ true, true, true, true, true ],
			},
			{
				name: 'Accept payments in 60+ countries',
				type: 'checkbox',
				data: [ true, true, true, true, true ],
			},
			{
				name: 'Integrations with top shipping carriers',
				type: 'checkbox',
				data: [ true, true, true, true, true ],
			},
			{
				name: 'Sell anything (products and/or services)',
				type: 'checkbox',
				data: [ true, true, true, true, true ],
			},
			{
				name: 'Premium customizable starter themes',
				type: 'checkbox',
				data: [ true, true, true, true, true ],
			},
		],
	},
	{
		id: 'marketing',
		name: 'Marketing',
		features: [
			{
				name: 'WordAds',
				type: 'checkbox',
				data: [ true, true, true, true, true ],
			},
			{
				name: 'Advanced social media tools',
				type: 'checkbox',
				data: [ true, true, true, true, true ],
			},
			{
				name: 'Video support',
				type: 'checkbox',
				data: [ true, true, true, true, true ],
			},
			{
				name: 'SEO tools',
				type: 'checkbox',
				data: [ true, true, true, true, true ],
			},
			{
				name: 'Commerce marketing tools',
				type: 'checkbox',
				data: [ true, true, true, true, true ],
			},
		],
	},
];
