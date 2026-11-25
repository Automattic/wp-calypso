import { ProgressState } from './schema';
import 'calypso/state/signup/init';

const initialState: ProgressState = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSignupProgress( state: any ): ProgressState {
	return state?.signup?.progress ?? initialState;
}
