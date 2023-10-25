import 'calypso/state/async-toast/init';
import type { IAppState } from 'calypso/state/types';

/**
 * Returns true if we are currently making a request to get the async toasts, and false otherwise.
 */
export default function isRequestingAsyncToast( state: IAppState ) {
	return state.asyncToast?.isRequesting ?? false;
}
