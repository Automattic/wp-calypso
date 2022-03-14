import { initialState } from './schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSocialProfiles( state: any ) {
	return state.difm?.socialProfiles || initialState;
}
