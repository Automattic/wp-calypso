/* global helpCenterData */
const isProxied = typeof helpCenterData !== 'undefined' && helpCenterData?.isProxied;

window.configData = {
	env_id: isProxied ? 'staging' : 'production',
	features: {
		'help/gpt-response': true,
		'unified-agent': false, // Enable to use unified AI agent instead of HelpCenterGPT
	},
	wapuu: false,
	i18n_default_locale_slug: 'en',
};
