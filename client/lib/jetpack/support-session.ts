const SUPPORT_SESSION_KEY = 'jetpack-cloud-support-session';
const SUPPORT_SESSION_LENGTH_MS = 15 * 60 * 60 * 1000;

export const startJetpackCloudSupportSession = () => {
	window.sessionStorage.setItem( SUPPORT_SESSION_KEY, new Date().getTime().toString() );
};

export const inJetpackCloudSupportSession = () => {
	const supportSessionValue = window.sessionStorage.getItem( SUPPORT_SESSION_KEY );
	if ( null !== supportSessionValue ) {
		const supportSessionTime = parseInt( supportSessionValue );
		const currentTime = new Date().getTime();
		if ( currentTime - supportSessionTime < SUPPORT_SESSION_LENGTH_MS ) {
			startJetpackCloudSupportSession();
			return true;
		}
		window.sessionStorage.removeItem( SUPPORT_SESSION_KEY );
	}
	return false;
};
