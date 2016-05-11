export const initSite = [
	{
		slug: 'vaultpress',
		name: 'VaultPress',
		key: 'vp-api-key',
		status: 'wait',
		error: null
	}, {
		slug: 'akismet',
		name: 'Akismet',
		key: 'ak-api-key',
		status: 'wait',
		error: null
	}, {
		slug: 'polldaddy',
		name: 'Polldaddy',
		key: 'pd-api-key',
		status: 'wait',
		error: null
	}
];

export const installingSite = [
	{
		slug: 'vaultpress',
		name: 'VaultPress',
		key: 'vp-api-key',
		status: 'done',
		error: null
	}, {
		slug: 'akismet',
		name: 'Akismet',
		key: 'ak-api-key',
		status: 'install',
		error: null
	}, {
		slug: 'polldaddy',
		name: 'Polldaddy',
		key: 'pd-api-key',
		status: 'wait',
		error: null
	}
];

export const activatingSite = [
	{
		slug: 'vaultpress',
		name: 'VaultPress',
		key: 'vp-api-key',
		status: 'done',
		error: null
	}, {
		slug: 'akismet',
		name: 'Akismet',
		key: 'ak-api-key',
		status: 'activate',
		error: null
	}, {
		slug: 'polldaddy',
		name: 'Polldaddy',
		key: 'pd-api-key',
		status: 'wait',
		error: null
	}
];

export const configuringSite = [
	{
		slug: 'vaultpress',
		name: 'VaultPress',
		key: 'vp-api-key',
		status: 'done',
		error: null
	}, {
		slug: 'akismet',
		name: 'Akismet',
		key: 'ak-api-key',
		status: 'configure',
		error: null
	}, {
		slug: 'polldaddy',
		name: 'Polldaddy',
		key: 'pd-api-key',
		status: 'wait',
		error: null
	}
];

export const finishedPluginSite = [
	{
		slug: 'vaultpress',
		name: 'VaultPress',
		key: 'vp-api-key',
		status: 'done',
		error: null
	}, {
		slug: 'akismet',
		name: 'Akismet',
		key: 'ak-api-key',
		status: 'done',
		error: null
	}, {
		slug: 'polldaddy',
		name: 'Polldaddy',
		key: 'pd-api-key',
		status: 'wait',
		error: null
	}
];

export const finishedSite = [
	{
		slug: 'vaultpress',
		name: 'VaultPress',
		key: 'vp-api-key',
		status: 'done',
		error: null
	}, {
		slug: 'akismet',
		name: 'Akismet',
		key: 'ak-api-key',
		status: 'done',
		error: null
	}, {
		slug: 'polldaddy',
		name: 'Polldaddy',
		key: 'pd-api-key',
		status: 'done',
		error: null
	}
];

export const siteWithError = [
	{
		slug: 'vaultpress',
		name: 'VaultPress',
		key: 'vp-api-key',
		status: 'done',
		error: null
	}, {
		slug: 'akismet',
		name: 'Akismet',
		key: 'ak-api-key',
		status: 'done',
		error: null
	}, {
		slug: 'polldaddy',
		name: 'Polldaddy',
		key: 'pd-api-key',
		status: 'activate',
		error: { name: 'ErrorCode', message: 'Something went wrong.' }
	}
];
