/* global helpCenterData */
const isProxied = typeof helpCenterData !== 'undefined' && helpCenterData?.isProxied;

window.configData = {
	env_id: isProxied ? 'staging' : 'production',
	features: {
		'help/gpt-response': true,
	},
	wapuu: false,
};
