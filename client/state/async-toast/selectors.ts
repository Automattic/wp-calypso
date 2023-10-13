import 'calypso/state/async-toast/init';
import type { AppState } from 'calypso/types';

export const getAsyncToast = ( state: AppState ) => {
	return state.asyncToast;
};
