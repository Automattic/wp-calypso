export default {
	main: {
		steps: [ 'user', 'site' ],
		destination: '/',
	},

	account: {
		steps: [ 'user', 'site' ],
		destination: '/',
	},

	other: {
		steps: [ 'user', 'site' ],
		destination: '/',
	},

	filtered: {
		steps: [ 'user', 'site' ],
		destination: '/',
	},

	onboarding: {
		steps: [
			'user',
			'site-type',
			'site-topic-with-preview',
			'site-title-with-preview',
			'site-style-with-preview',
			'domains-with-preview',
			'plans',
		],
		destination: '/',
	},

	'onboarding-blog': {
		steps: [ 'user', 'site-type', 'site-topic', 'site-title', 'domains', 'plans' ],
		destination: '/',
	},

	'disallow-resume': {
		steps: [
			'user',
			'site-type',
			'site-topic-with-preview',
			'site-title-with-preview',
			'site-style-with-preview',
			'domains-with-preview',
			'plans',
		],
		destination: '/',
		disallowResume: true,
	},
};
