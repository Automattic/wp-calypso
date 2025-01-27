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

	return (
		wooDnaConfig( currentQueryArgs ).isWooDnaFlow() ||
		wooDnaConfig( initialQueryArgs ).isWooDnaFlow()
	);
};

export default isWooDnaFlow;
