import wooDnaConfig from 'calypso/jetpack-connect/woo-dna-config';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import type { AppState } from 'calypso/types';

/**
 * Returns true if the user reached Calypso via a WooDNA flow.
 * This is indicated by the `woodna_service_name` query parameter being present.
 * @param  {Object}   state  Global state tree
 * @returns {?boolean}       Whether the user reached Calypso via a WooDNA flow.
 */
export const isWooDnaFlow = ( state: AppState ): boolean => {
	const currentQueryArgs = getCurrentQueryArguments( state ) ?? {};
	const initialQueryArgs = getInitialQueryArguments( state ) ?? {};

	// Check direct query parameters first
	if (
		wooDnaConfig( currentQueryArgs ).isWooDnaFlow() ||
		wooDnaConfig( initialQueryArgs ).isWooDnaFlow()
	) {
		return true;
	}

	/**
	 * On the WooDNA flow (used for WooCommerce Shipping and Tax), the flow starts with /jetpack/connect/authorize.
	 * If a user fills in an email that already exists, they are offered a login link to /log-in/jetpack.
	 *
	 * Visiting that page removes the original WooDNA query parameters from the current URL, making it harder
	 * to detect the WooDNA flow. To handle this case, we need to parse the redirect_to parameter which
	 * contains the original URL with the WooDNA parameters.
	 */
	try {
		const redirectTo = state.login?.redirectTo?.original;
		if ( redirectTo ) {
			const redirectParams = new URLSearchParams( redirectTo.split( '?' )[ 1 ] );
			const redirectQuery = Object.fromEntries( redirectParams.entries() );
			if ( wooDnaConfig( redirectQuery ).isWooDnaFlow() ) {
				return true;
			}
		}
	} catch ( e ) {
		// ignore parsing errors
	}

	return false;
};

export default isWooDnaFlow;
