import { HelpCenterThunkProps } from './types';
import { getPersistedPreference } from './utils';

export function isHelpCenterShown() {
	return async ( { dispatch }: HelpCenterThunkProps ) => {
		try {
			const helpCenterOpen = await getPersistedPreference( 'help_center_open' );

			// We only want to auto-open, we don't want to auto-close (and potentially overrule the user's action).
			if ( helpCenterOpen ) {
				dispatch( {
					type: 'HELP_CENTER_SET_SHOW',
					show: true,
				} as const );
			}
		} catch {
			dispatch( {
				type: 'HELP_CENTER_SET_SHOW',
				show: false,
			} as const );
		}
	};
}

export function getHelpCenterRouterHistory() {
	return async ( { dispatch, select }: HelpCenterThunkProps ) => {
		const route = select.getNavigateToRoute();

		// Don't use the history from the preferences if route is defined to avoid a race condition between restoring
		// persisted data and setting the support doc data. Persisted values could overwrite freshly fetched data.
		if ( typeof route === 'undefined' ) {
			const routerHistory = await getPersistedPreference( 'help_center_router_history' );

			// We only want to auto-open, we don't want to auto-close (and potentially overrule the user's action).
			if ( routerHistory ) {
				dispatch( {
					type: 'HELP_CENTER_SET_HELP_CENTER_ROUTER_HISTORY',
					history: routerHistory,
				} as const );
			}
		}
	};
}

export function getIsMinimized() {
	return async ( { dispatch }: HelpCenterThunkProps ) => {
		const minimized = await getPersistedPreference( 'help_center_minimized' );
		dispatch( {
			type: 'HELP_CENTER_SET_MINIMIZED',
			minimized: minimized ?? false,
		} as const );
	};
}
