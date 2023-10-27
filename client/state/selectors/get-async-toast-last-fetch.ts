import 'calypso/state/async-toast/init';
import type { IAppState } from 'calypso/state/types';

/**
 * Returns the current async toast map, or an empty map if it has not yet been fetched.
 */
export default function getAsyncToastLastFetch( state: IAppState ): number {
	return state.asyncToast?.lastFetch ?? 0;
}
