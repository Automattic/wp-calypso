export default {
	main: {
		steps: [ 'user', 'domains' ],
		destination: '/',
	},

	account: {
		steps: [ 'user', 'domains' ],
		destination: '/',
	},

	other: {
		steps: [ 'user', 'domains' ],
		destination: '/',
	},

	filtered: {
		steps: [ 'user', 'domains' ],
		destination: '/',
	},

	onboarding: {
		steps: [
			'user',
			'site-type',
			'site-topic-with-preview',
			'site-title-with-preview',
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
			'domains-with-preview',
			'plans',
		],
		destination: '/',
		disallowResume: true,
	},
};
