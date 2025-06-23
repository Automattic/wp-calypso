import { useCallback } from '@wordpress/element';
import { isEmpty } from 'lodash';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSignupUrl, pathWithLeadingSlash } from 'calypso/lib/login';
import { redirectToLogout } from 'calypso/state/current-user/actions';
import { isUserLoggedIn, getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import { getCurrentQueryArguments } from 'calypso/state/selectors/get-current-query-arguments';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import { getInitialQueryArguments } from 'calypso/state/selectors/get-initial-query-arguments';
import getIsWCCOM from 'calypso/state/selectors/get-is-wccom';
import { isWooJPCFlow } from 'calypso/state/selectors/is-woo-jpc-flow';

interface UseSignupUrlOptions {
	pathname?: string;
	locale?: string;
	signupUrl?: string;
}

/**
 * Hook to compute the signup URL for the current login context.
 */
export function useSignupUrl( { pathname, locale, signupUrl }: UseSignupUrlOptions = {} ): string {
	const currentRoute = useSelector( getCurrentRoute );
	const oauth2Client = useSelector( getCurrentOAuth2Client );
	const currentQuery = useSelector( getCurrentQueryArguments );
	const initialQuery = useSelector( getInitialQueryArguments );
	const isWCCOM = useSelector( getIsWCCOM );
	const isWooJPC = useSelector( isWooJPCFlow );
	const userLocale = useSelector( getCurrentUserLocale );

	const effectivePathname =
		pathname || ( typeof window !== 'undefined' ? window.location.pathname : '/' );
	const effectiveLocale = locale || userLocale;

	if ( signupUrl ) {
		return (
			( typeof window !== 'undefined' ? window.location.origin : '' ) +
			pathWithLeadingSlash( signupUrl )
		);
	}

	if ( isWCCOM && isEmpty( currentQuery ) ) {
		return 'https://woocommerce.com/start/';
	}

	if ( isWooJPC && isEmpty( currentQuery ) ) {
		return getSignupUrl(
			initialQuery,
			currentRoute,
			oauth2Client,
			effectiveLocale,
			effectivePathname
		);
	}

	return getSignupUrl(
		currentQuery,
		currentRoute,
		oauth2Client,
		effectiveLocale,
		effectivePathname
	);
}

interface UseSignupLinkComponentOptions extends UseSignupUrlOptions {}

/**
 * Hook to get a signup link component with correct logout and redirect logic.
 * Returns a self-closing <a> element with no children, matching the original getSignupLinkComponent.
 */
export function useSignupLinkComponent( {
	pathname,
	locale,
	signupUrl,
}: UseSignupLinkComponentOptions = {} ): React.ReactElement | null {
	const dispatch = useDispatch();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const url = useSignupUrl( { pathname, locale, signupUrl } );

	const handleClick = useCallback(
		( event: React.MouseEvent< HTMLAnchorElement > ) => {
			event.preventDefault();
			if ( isLoggedIn ) {
				dispatch( redirectToLogout( url ) );
			} else {
				window.location.href = url;
			}
		},
		[ dispatch, isLoggedIn, url ]
	);

	return <a href={ url } onClick={ handleClick } />;
}
