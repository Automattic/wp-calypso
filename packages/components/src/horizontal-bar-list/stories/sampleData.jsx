// Video widget
import { localizeUrl } from '@automattic/i18n-utils';

const videData = [
	{
		label: 'A video type widget',
		value: 1,
		page: 'https://www.google.com/', // it should be a relative link to a blog page
		actions: [
			{
				data: 'https://www.google.com', // a direct link to the resource
				type: 'link',
			},
		],
	},
];

// Authors widget
const authorsData = [
	{
		label: 'Jason Bourne',
		iconClassName: 'avatar-user',
		icon: 'https://placekitten.com/50/50',
		children: [
			{
				label: 'Google',
				value: 18,
				page: 'https://www.google.com/', // it should be a relative link to a blog page
				actions: [
					{
						type: 'link',
						data: 'https://www.google.com', // a direct link to the resource
					},
				],
				children: null,
			},
			{
				label: 'Google',
				value: 2,
				page: 'https://www.google.com/', // it should be a relative link to a blog page
				actions: [
					{
						type: 'link',
						data: 'https://www.google.com', // a direct link to the resource
					},
				],
				children: null,
			},
		],
		value: 23,
		className: 'module-content-list-item-large',
	},
];

// Referrers
const referrersData = [
	{
		label: 'Reader',
		value: 18,
		link: 'https://www.google.com',
		labelIcon: 'external',
		icon: 'https://placekitten.com/50/50',
		actions: [],
		actionMenu: 0,
	},
	{
		label: 'google.com',
		value: 17,
		link: 'https://www.google.com',
		labelIcon: 'external',
		icon: 'https://placekitten.com/50/50',
		actions: [
			{
				type: 'spam',
				data: {
					siteID: 123456,
					domain: 'google.com',
				},
			},
		],
		actionMenu: 1,
	},
	{
		label: 'Search Engines',
		value: 3,
		labelIcon: null,
		children: [
			{
				label: 'Google Search',
				value: 3,
				link: 'http://www.google.com/',
				labelIcon: 'external',
				icon: 'https://placekitten.com/50/50',
			},
		],
		icon: 'https://placekitten.com/50/50',
		actions: [],
		actionMenu: 0,
	},
];

const clicksData = [
	{
		label: 'google.com',
		value: 7,
		children: [
			{
				label: 'google.com',
				value: 3,
				children: null,
				link: 'http://www.google.com/',
				labelIcon: 'external',
			},
			{
				label: 'google.com',
				value: 2,
				children: null,
				link: 'http://www.google.com/',
				labelIcon: 'external',
			},
		],
		link: null,
		icon: 'https://placekitten.com/50/50',
		labelIcon: null,
	},
	{
		label: 'google.com',
		value: 6,
		children: [
			{
				label: 'google.com',
				value: 2,
				children: null,
				link: 'http://www.google.com/',
				labelIcon: 'external',
			},
			{
				label: 'google.com',
				value: 1,
				children: null,
				link: 'http://www.google.com/',
				labelIcon: 'external',
			},
		],
		link: null,
		icon: 'https://placekitten.com/50/50',
		labelIcon: null,
	},
	{
		label: 'google.com',
		value: 1,
		children: null,
		link: 'http://www.google.com/',
		icon: 'https://placekitten.com/50/50',
		labelIcon: 'external',
	},
];

const countryData = [
	{
		label: 'United States',
		countryCode: 'US',
		value: 345,
		region: '021',
	},
	{
		label: 'Australia',
		countryCode: 'AU',
		value: 217,
		region: '053',
	},
	{
		label: 'Netherlands',
		countryCode: 'NL',
		value: 171,
		region: '155',
	},
	{
		label: 'Taiwan',
		countryCode: 'TW',
		value: 97,
		region: '030',
	},
	{
		label: 'United Kingdom',
		countryCode: 'GB',
		value: 33,
		region: '154',
	},
	{
		label: 'New Zealand',
		countryCode: 'NZ',
		value: 19,
		region: '053',
	},
	{
		label: 'India',
		countryCode: 'IN',
		value: 18,
		region: '034',
	},
	{
		label: 'Spain',
		countryCode: 'ES',
		value: 13,
		region: '039',
	},
	{
		label: 'Argentina',
		countryCode: 'AR',
		value: 13,
		region: '005',
	},
	{
		label: 'Brazil',
		countryCode: 'BR',
		value: 8,
		region: '005',
	},
];

const filedownloadsData = [
	{
		label: '/2021/01/sample-file.pdf',
		shortLabel: 'sample-file.pdf',
		page: null,
		value: 45,
		link: 'https://www.google.com',
		linkTitle: '/2021/01/sample-file.pdf',
		labelIcon: 'external',
	},
	{
		label: '/2017/12/test-file.pdf',
		shortLabel: 'test-file.pdf',
		page: null,
		value: 25,
		link: 'https://www.google.com',
		linkTitle: '/2017/12/test-file.pdf',
		labelIcon: 'external',
	},
];

const searchTermsData = [
	{
		label: 'https://www.google.com',
		className: 'user-selectable',
		value: 2,
	},
	{
		label: 'Unknown Search Terms',
		value: 3,
		link: localizeUrl( 'https://wordpress.com/support/stats/#search-engine-terms' ),
		labelIcon: 'external',
	},
];

const postsData = [
	{
		id: 0,
		label: 'Home page',
		value: 365,
		page: 'https://www.google.com/', // it should be a relative link to a blog page
		public: false,
		actions: [
			{
				type: 'link',
				data: 'https://www.google.com', // a direct link to the resource
			},
		],
		labelIcon: null,
		children: null,
		className: null,
	},
	{
		id: 212,
		label: 'Monday Morning',
		value: 21,
		page: 'https://www.google.com/', // it should be a relative link to a blog page
		public: true,
		actions: [
			{
				type: 'link',
				data: 'https://www.google.com', // a direct link to the resource
			},
		],
		labelIcon: null,
		children: null,
		className: 'published', // blue bar
	},
];

export {
	videData,
	authorsData,
	referrersData,
	clicksData,
	countryData,
	filedownloadsData,
	searchTermsData,
	postsData,
};
