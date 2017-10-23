/** @format */
export function hasStripeKeyPairForMode( method ) {
	const { settings } = method;
	const isLiveMode = method.settings.testmode.value !== 'yes';
	if ( isLiveMode ) {
		return settings.secret_key.value.trim() && settings.publishable_key.value.trim();
	}
	return settings.test_secret_key.value.trim() && settings.test_publishable_key.value.trim();
}

export function getStripeSampleStatementDescriptor( domain ) {
	return domain
		.substr( 0, 22 )
		.trim()
		.toUpperCase();
}
