import { useCurrentRoute } from 'calypso/components/route';

export function useIsPartnerSignup() {
	const { currentQuery } = useCurrentRoute() as {
		currentQuery: Record< string, string | string[] > | false | null;
	};

	return isPartnerSignupQuery( currentQuery );
}

export function isPartnerSignupQuery(
	currentQuery: Record< string, string | string[] > | false | null
): boolean {
	if ( ! currentQuery ) {
		return false;
	}

	if ( typeof currentQuery?.redirect_to === 'string' ) {
		return /woocommerce\.com\/partner-signup/.test( currentQuery.redirect_to );
	}

	if ( typeof currentQuery?.oauth2_redirect === 'string' ) {
		return /woocommerce\.com%2Fpartner-signup/.test( currentQuery.oauth2_redirect );
	}

	return false;
}
