const OAUTH_OVERRIDE_KEY = 'jetpack-cloud-oauth-override';
const OAUTH_OVERRIDE_LENGTH_MS = 15 * 60 * 1000;

export const startJetpackCloudOAuthOverride = () => {
	window.sessionStorage.setItem( OAUTH_OVERRIDE_KEY, new Date().getTime().toString() );
};

export const inJetpackCloudOAuthOverride = () => {
	const oauthOverrideValue = window.sessionStorage.getItem( OAUTH_OVERRIDE_KEY );
	if ( null !== oauthOverrideValue ) {
		const oauthOverrideTime = parseInt( oauthOverrideValue );
		const currentTime = new Date().getTime();
		if ( currentTime - oauthOverrideTime < OAUTH_OVERRIDE_LENGTH_MS ) {
			startJetpackCloudOAuthOverride();
			return true;
		}
		window.sessionStorage.removeItem( OAUTH_OVERRIDE_KEY );
	}
	return false;
};
