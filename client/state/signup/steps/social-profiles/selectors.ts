import 'calypso/state/signup/init';
import { initialState } from './schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSocialProfiles( state: any ) {
	return state.signup?.steps?.socialProfiles || initialState;
}
