/* global helpCenterData */
const isProxied = typeof helpCenterData !== 'undefined' && helpCenterData?.isProxied;
const isCIAB = typeof helpCenterData !== 'undefined' && helpCenterData?.isCommerceGarden;
const envValue = isProxied && ! isCIAB ? 'staging' : 'production';

window.configData = {
	env_id: envValue,
	env: envValue,
	features: {
		'help/gpt-response': true,
	},
	wapuu: false,
	i18n_default_locale_slug: 'en',
};
