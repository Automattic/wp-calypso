import type { State } from './reducers';
import type { ImportJob } from './types';

export function getImportSubscribersSelector( state: State ) {
	return state.subscriber.import;
}

export function getImportJobsSelector( state: State ) {
	return state.subscriber.imports;
}

export function getAddSubscribersSelector( state: State ) {
	return state.subscriber.add;
}

export function getLatestImportJobSelector( state: State ): ImportJob | undefined {
	const imports = state.subscriber?.imports || [];
	return imports[ 0 ];
}
