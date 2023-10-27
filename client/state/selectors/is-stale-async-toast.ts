import 'calypso/state/async-toast/init';
import type { IAppState } from 'calypso/state/types';

/**
 * Returns true if the cached async toast state is known to be stale, and false otherwise.
 * Note that isStale == false does not mean the state is not stale, rather that we don't
 * know. E.g. if the state changes on the backend the data will be stale.
 */
export default function isStaleAsyncToast( state: IAppState ) {
	return state.asyncToast?.isStale ?? false;
}
