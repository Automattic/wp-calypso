export const initSite = [
	{
		slug: 'vaultpress',
		name: 'VaultPress',
		key: 'vp-api-key',
		status: {
			start: false,
			install: null,
			activate: null,
			config: null,
			done: false,
		},
		error: null
	}, {
		slug: 'akismet',
		name: 'Akismet',
		key: 'ak-api-key',
		status: {
			start: false,
			install: null,
			activate: null,
			config: null,
			done: false,
		},
		error: null
	}, {
		slug: 'polldaddy',
		name: 'Polldaddy',
		key: 'pd-api-key',
		status: {
			start: false,
			install: null,
			activate: null,
			config: null,
			done: false,
		},
		error: null
	}
];

export const installingSite = [
	{
		slug: 'vaultpress',
		name: 'VaultPress',
		key: 'vp-api-key',
		status: {
			start: false,
			install: false,
			activate: false,
			config: false,
			done: true,
		},
		error: null
	}, {
		slug: 'akismet',
		name: 'Akismet',
		key: 'ak-api-key',
		status: {
			start: true,
			install: true,
			activate: null,
			config: null,
			done: false,
		},
		error: null
	}, {
		slug: 'polldaddy',
		name: 'Polldaddy',
		key: 'pd-api-key',
		status: {
			start: false,
			install: null,
			activate: null,
			config: null,
			done: false,
		},
		error: null
	}
];

export const activatingSite = [
	{
		slug: 'vaultpress',
		name: 'VaultPress',
		key: 'vp-api-key',
		status: {
			start: false,
			install: false,
			activate: false,
			config: false,
			done: true,
		},
		error: null
	}, {
		slug: 'akismet',
		name: 'Akismet',
		key: 'ak-api-key',
		status: {
			start: true,
			install: false,
			activate: true,
			config: null,
			done: false,
		},
		error: null
	}, {
		slug: 'polldaddy',
		name: 'Polldaddy',
		key: 'pd-api-key',
		status: {
			start: false,
			install: null,
			activate: null,
			config: null,
			done: false,
		},
		error: null
	}
];

export const configuringSite = [
	{
		slug: 'vaultpress',
		name: 'VaultPress',
		key: 'vp-api-key',
		status: {
			start: false,
			install: false,
			activate: false,
			config: false,
			done: true,
		},
		error: null
	}, {
		slug: 'akismet',
		name: 'Akismet',
		key: 'ak-api-key',
		status: {
			start: true,
			install: false,
			activate: false,
			config: true,
			done: false,
		},
		error: null
	}, {
		slug: 'polldaddy',
		name: 'Polldaddy',
		key: 'pd-api-key',
		status: {
			start: false,
			install: null,
			activate: null,
			config: null,
			done: false,
		},
		error: null
	}
];

export const finishedPluginSite = [
	{
		slug: 'vaultpress',
		name: 'VaultPress',
		key: 'vp-api-key',
		status: {
			start: false,
			install: false,
			activate: false,
			config: false,
			done: true,
		},
		error: null
	}, {
		slug: 'akismet',
		name: 'Akismet',
		key: 'ak-api-key',
		status: {
			start: true,
			install: false,
			activate: false,
			config: false,
			done: true,
		},
		error: null
	}, {
		slug: 'polldaddy',
		name: 'Polldaddy',
		key: 'pd-api-key',
		status: {
			start: false,
			install: null,
			activate: null,
			config: null,
			done: false,
		},
		error: null
	}
];

export const finishedSite = [
	{
		slug: 'vaultpress',
		name: 'VaultPress',
		key: 'vp-api-key',
		status: {
			start: false,
			install: false,
			activate: false,
			config: false,
			done: true,
		},
		error: null
	}, {
		slug: 'akismet',
		name: 'Akismet',
		key: 'ak-api-key',
		status: {
			start: false,
			install: false,
			activate: false,
			config: false,
			done: true,
		},
		error: null
	}, {
		slug: 'polldaddy',
		name: 'Polldaddy',
		key: 'pd-api-key',
		status: {
			start: false,
			install: false,
			activate: false,
			config: false,
			done: true,
		},
		error: null
	}
];

export const siteWithError = [
	{
		slug: 'vaultpress',
		name: 'VaultPress',
		key: 'vp-api-key',
		status: {
			start: false,
			install: false,
			activate: false,
			config: false,
			done: true,
		},
		error: null
	}, {
		slug: 'akismet',
		name: 'Akismet',
		key: 'ak-api-key',
		status: {
			start: false,
			install: false,
			activate: false,
			config: false,
			done: true,
		},
		error: null
	}, {
		slug: 'polldaddy',
		name: 'Polldaddy',
		key: 'pd-api-key',
		status: {
			start: true,
			install: false,
			activate: true,
			config: null,
			done: false,
		},
		error: { name: 'ErrorCode', message: 'Something went wrong.' }
	}
];
