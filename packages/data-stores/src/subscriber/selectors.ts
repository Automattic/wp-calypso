import type { State } from './reducers';
import type { ImportJob } from './types';

export const getState = ( state: State ) => state.subscriber;
export const getHydrationStatus = ( state: State ) => state.subscriber.hydrated;
export const getAddSubscribersSelector = ( state: State ) => state.subscriber.add;
export const getImportSubscribersSelector = ( state: State ) => state.subscriber.import;
export const getImportJobsSelector = ( state: State ) => state.subscriber.imports;

export function getLatestImportJobSelector( state: State ): ImportJob | undefined {
	const imports = state.subscriber?.imports || [];
	return imports[ 0 ];
}
