/* global wpcomSmartDictationData */
const smartDictationData =
	typeof wpcomSmartDictationData !== 'undefined' ? wpcomSmartDictationData : {};
const isProxied = smartDictationData?.isProxied;
const envValue = isProxied ? 'staging' : 'production';

window.configData = {
	env_id: envValue,
	env: envValue,
	i18n_default_locale_slug: smartDictationData?.localeSlug || 'en',
};
