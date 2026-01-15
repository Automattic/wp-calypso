import { Preferences } from './types';

export const STORE_KEY = 'automattic/help-center';
export const DEFAULT_PREFERENCES: Preferences[ 'calypso_preferences' ] = {
	help_center_open: undefined,
	help_center_minimized: false,
	help_center_router_history: null,
};

export const PREFERENCES_KEY = 'logged_out_help_center_preferences';
