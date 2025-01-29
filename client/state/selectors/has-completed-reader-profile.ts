import { AppState } from 'calypso/types';

export default ( state: AppState ): boolean =>
	state.userSettings.settings?.first_name &&
	state.userSettings.settings?.last_name &&
	state.userSettings.settings?.has_gravatar &&
	state.userSettings.settings?.description;
