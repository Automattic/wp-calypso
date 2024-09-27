/* global helpCenterData */
window.configData = {
	env_id: helpCenterData?.isProxied ? 'staging' : 'production',
	zendesk_support_chat_key: helpCenterData?.isProxied
		? '715f17a8-4a28-4a7f-8447-0ef8f06c70d7'
		: 'cec07bc9-4da6-4dd2-afa7-c7e01ae73584',
	features: {
		'help/gpt-response': true,
	},
	wapuu: false,
};
