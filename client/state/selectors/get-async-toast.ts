import 'calypso/state/async-toast/init';
import { AsyncToastMap } from '../async-toast/types';
import type { IAppState } from 'calypso/state/types';

/**
 * Returns the current async toast map, or an empty map if it has not yet been fetched.
 */
export default function getAsyncToast( state: IAppState ): AsyncToastMap {
	return state.asyncToast?.toasts ?? new Map();
}
