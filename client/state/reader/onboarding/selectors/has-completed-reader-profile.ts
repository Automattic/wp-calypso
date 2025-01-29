import { AppState } from 'calypso/types';
import { isProfileComplete } from '../utils';

export default ( state: AppState ): boolean => {
	return isProfileComplete( state.userSettings.settings, state.gravatarStatus );
};
