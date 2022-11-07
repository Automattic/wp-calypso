import { IAppState } from '../types';

export const getIsStateRandomlyCleared = ( state: IAppState ) => {
	return state.startupFlags.isStateRandomlyCleared ?? false;
};
