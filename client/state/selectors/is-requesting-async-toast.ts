import 'calypso/state/async-toast/init';
import type { IAppState } from 'calypso/state/types';

/**
 * Returns true if we are currently making a request to get the billing transactions.
 * False otherwise.
 */
export default function isRequestingAsyncToast( state: IAppState ) {
	return state.asyncToast?.isRequesting ?? false;
}
