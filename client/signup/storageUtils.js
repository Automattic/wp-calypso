import cookie from 'cookie';

export const persistSignupDestination = ( url ) => {
	const DAY_IN_SECONDS = 3600 * 24;
	const expirationDate = new Date( new Date().getTime() + DAY_IN_SECONDS * 1000 );
	const options = { path: '/', expires: expirationDate, sameSite: 'strict' };
	document.cookie = cookie.serialize( 'wpcom_signup_complete_destination', url, options );
};

export const retrieveSignupDestination = () => {
	const cookies = cookie.parse( document.cookie );
	return cookies.wpcom_signup_complete_destination;
};

export const clearSignupDestinationCookie = () => {
	// Set expiration to a random time in the past so that the cookie gets removed.
	const expirationDate = new Date( new Date().getTime() - 1000 );
	const options = { path: '/', expires: expirationDate };

	document.cookie = cookie.serialize( 'wpcom_signup_complete_destination', '', options );
};

export const persistSignupDependencies = ( dependencies ) => {
	const DAY_IN_SECONDS = 3600 * 24;
	const expirationDate = new Date( new Date().getTime() + DAY_IN_SECONDS * 1000 );
	const options = {
		expires: expirationDate,
		path: '/',
	};
	document.cookie = cookie.serialize(
		'wpcom_signup_dependencies',
		JSON.stringify( dependencies ),
		options
	);
};

export const retrieveSignupDependencies = () => {
	const cookies = cookie.parse( document.cookie );
	return cookies.wpcom_signup_dependencies;
};

/**
 * Ignore fatals when trying to access window.sessionStorage so that we do not
 * see them logged in Sentry. Please don't use this for anything else.
 */
function ignoreFatalsForSessionStorage( callback ) {
	try {
		return callback();
	} catch {
		// Do nothing.
		return undefined;
	}
}

export const getSignupCompleteSlug = () =>
	ignoreFatalsForSessionStorage( () =>
		sessionStorage?.getItem( 'wpcom_signup_complete_site_slug' )
	);
export const setSignupCompleteSlug = ( value ) =>
	ignoreFatalsForSessionStorage( () =>
		sessionStorage?.setItem( 'wpcom_signup_complete_site_slug', value )
	);
export const wasSignupCheckoutPageUnloaded = () =>
	ignoreFatalsForSessionStorage( () =>
		sessionStorage?.getItem( 'was_signup_checkout_page_unloaded' )
	);
export const setSignupCheckoutPageUnloaded = ( value ) =>
	ignoreFatalsForSessionStorage( () =>
		sessionStorage?.setItem( 'was_signup_checkout_page_unloaded', value )
	);
export const getSignupCompleteFlowName = () =>
	ignoreFatalsForSessionStorage( () =>
		sessionStorage?.getItem( 'wpcom_signup_complete_flow_name' )
	);
export const setSignupCompleteFlowName = ( value ) =>
	ignoreFatalsForSessionStorage( () =>
		sessionStorage?.setItem( 'wpcom_signup_complete_flow_name', value )
	);
export const clearSignupCompleteFlowName = () =>
	ignoreFatalsForSessionStorage( () =>
		sessionStorage?.removeItem( 'wpcom_signup_complete_flow_name' )
	);
export const getSignupCompleteFlowNameAndClear = () => {
	const value = getSignupCompleteFlowName();
	clearSignupCompleteFlowName();
	return value;
};
export const getSignupCompleteStepName = () =>
	ignoreFatalsForSessionStorage( () =>
		sessionStorage?.getItem( 'wpcom_signup_complete_step_name' )
	);
export const setSignupCompleteStepName = ( value ) =>
	ignoreFatalsForSessionStorage( () =>
		sessionStorage?.setItem( 'wpcom_signup_complete_step_name', value )
	);
export const clearSignupCompleteStepName = () =>
	ignoreFatalsForSessionStorage( () =>
		sessionStorage?.removeItem( 'wpcom_signup_complete_step_name' )
	);
export const getSignupCompleteStepNameAndClear = () => {
	const value = getSignupCompleteStepName();
	clearSignupCompleteStepName();
	return value;
};
export const setSignupStartTime = () =>
	ignoreFatalsForSessionStorage( () =>
		sessionStorage?.setItem( 'wpcom_signup_start_time', performance.now() )
	);
export const getSignupStartTime = () =>
	ignoreFatalsForSessionStorage( () => sessionStorage?.getItem( 'wpcom_signup_start_time' ) );

export const clearSignupStartTime = () =>
	ignoreFatalsForSessionStorage( () => sessionStorage?.removeItem( 'wpcom_signup_start_time' ) );

export const getSignupCompleteElapsedTime = () => {
	const startTime = getSignupStartTime();

	if ( startTime == null ) {
		return null;
	}

	clearSignupStartTime();

	return Math.floor( performance.now() - startTime );
};
