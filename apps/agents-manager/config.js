/* global agentsManagerData */
const isDevMode = typeof agentsManagerData !== 'undefined' && agentsManagerData?.isDevMode;
const envValue = isDevMode ? 'staging' : 'production';

window.configData = {
	env_id: envValue,
	env: envValue,
};
