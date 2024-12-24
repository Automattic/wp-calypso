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

/**
 * Ignore fatals when trying to access window.sessionStorage so that we do not
 * see them logged in Sentry. Please don't use this for anything else.
 */
function ignoreFatalsForStorage( callback ) {
	try {
		return callback();
	} catch {
		// Do nothing.
		return undefined;
	}
}

export const getSignupCompleteSlug = () =>
	ignoreFatalsForStorage( () => sessionStorage?.getItem( 'wpcom_signup_complete_site_slug' ) );
export const setSignupCompleteSlug = ( value ) =>
	ignoreFatalsForStorage( () =>
		sessionStorage?.setItem( 'wpcom_signup_complete_site_slug', value )
	);
export const getSignupCompleteSiteID = () =>
	ignoreFatalsForStorage( () => sessionStorage?.getItem( 'wpcom_signup_complete_site_id' ) );
export const setSignupCompleteSiteID = ( value ) =>
	ignoreFatalsForStorage( () => sessionStorage?.setItem( 'wpcom_signup_complete_site_id', value ) );
export const setDomainsDependencies = ( dependencies ) => {
	ignoreFatalsForStorage( () =>
		sessionStorage.setItem( 'wpcom_domains_dependencies', JSON.stringify( dependencies ) )
	);
};
export const getDomainsDependencies = () =>
	ignoreFatalsForStorage( () => sessionStorage?.getItem( 'wpcom_domains_dependencies' ) );
export const clearDomainsDependencies = () =>
	ignoreFatalsForStorage( () => sessionStorage?.removeItem( 'wpcom_domains_dependencies' ) );
export const wasSignupCheckoutPageUnloaded = () =>
	ignoreFatalsForStorage( () => sessionStorage?.getItem( 'was_signup_checkout_page_unloaded' ) );
export const setSignupCheckoutPageUnloaded = ( value ) =>
	ignoreFatalsForStorage( () =>
		sessionStorage?.setItem( 'was_signup_checkout_page_unloaded', value )
	);
export const getSignupCompleteFlowName = () =>
	ignoreFatalsForStorage( () => sessionStorage?.getItem( 'wpcom_signup_complete_flow_name' ) );

export const getHasRedirectedForExperiment = () =>
	ignoreFatalsForStorage( () =>
		sessionStorage?.getItem(
			'wpcom_redirected_calypso_signup_onboarding_stepper_flow_confidence_check_2'
		)
	);

export const setHasRedirectedForExperiment = () =>
	ignoreFatalsForStorage( () =>
		sessionStorage?.setItem(
			'wpcom_redirected_calypso_signup_onboarding_stepper_flow_confidence_check_2',
			'1'
		)
	);

export const setSignupCompleteFlowName = ( value ) =>
	ignoreFatalsForStorage( () =>
		sessionStorage?.setItem( 'wpcom_signup_complete_flow_name', value )
	);
export const clearSignupCompleteFlowName = () =>
	ignoreFatalsForStorage( () => sessionStorage?.removeItem( 'wpcom_signup_complete_flow_name' ) );
export const getSignupCompleteFlowNameAndClear = () => {
	const value = getSignupCompleteFlowName();
	clearSignupCompleteFlowName();
	return value;
};
export const getSignupCompleteStepName = () =>
	ignoreFatalsForStorage( () => sessionStorage?.getItem( 'wpcom_signup_complete_step_name' ) );
export const setSignupCompleteStepName = ( value ) =>
	ignoreFatalsForStorage( () =>
		sessionStorage?.setItem( 'wpcom_signup_complete_step_name', value )
	);
export const clearSignupCompleteStepName = () =>
	ignoreFatalsForStorage( () => sessionStorage?.removeItem( 'wpcom_signup_complete_step_name' ) );
export const getSignupCompleteStepNameAndClear = () => {
	const value = getSignupCompleteStepName();
	clearSignupCompleteStepName();
	return value;
};
export const setSignupStartTime = () =>
	ignoreFatalsForStorage( () =>
		sessionStorage?.setItem( 'wpcom_signup_start_time', performance.now() )
	);
export const getSignupStartTime = () =>
	ignoreFatalsForStorage( () => sessionStorage?.getItem( 'wpcom_signup_start_time' ) );

export const clearSignupStartTime = () =>
	ignoreFatalsForStorage( () => sessionStorage?.removeItem( 'wpcom_signup_start_time' ) );

export const getSignupCompleteElapsedTime = () => {
	const startTime = getSignupStartTime();

	if ( startTime == null ) {
		return null;
	}

	clearSignupStartTime();

	return Math.floor( performance.now() - startTime );
};

export const setSignupIsNewUser = ( userId ) =>
	ignoreFatalsForStorage( () =>
		localStorage?.setItem( `wpcom_signup_is_new_user_${ userId }`, true )
	);
export const getSignupIsNewUser = ( userId ) =>
	ignoreFatalsForStorage( () => localStorage?.getItem( `wpcom_signup_is_new_user_${ userId }` ) );
export const clearSignupIsNewUser = ( userId ) =>
	ignoreFatalsForStorage( () =>
		localStorage?.removeItem( `wpcom_signup_is_new_user_${ userId }` )
	);
export const getSignupIsNewUserAndClear = ( userId ) => {
	const value = getSignupIsNewUser( userId );
	clearSignupIsNewUser( userId );
	return value;
};
