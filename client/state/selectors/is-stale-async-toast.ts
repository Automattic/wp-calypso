import 'calypso/state/async-toast/init';
import type { IAppState } from 'calypso/state/types';

/**
 * Returns true if we are currently making a request to get the billing transactions.
 * False otherwise.
 */
export default function isStaleAsyncToast( state: IAppState ) {
	return state.asyncToast?.isStale ?? false;
}
