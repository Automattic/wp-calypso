import { Provider as ReduxProvider } from 'react-redux';

type StoreType = Parameters< typeof ReduxProvider >[ 0 ][ 'store' ];

// Fake Redux store so child components using connect() (e.g. Notifications) don't crash.
// Intercepts specific actions so the dashboard can handle them.
export function createOmnibarStore( onToggleNotifications?: () => void ): StoreType {
	const listeners = new Set< () => void >();
	let notificationsUnseenCount: number | undefined;
	let isNotificationsOpen = false;

	return {
		getState: () => ( {
			ui: { section: false, isNotificationsOpen },
			notificationsUnseenCount,
		} ),
		dispatch: ( action: { type: string; unseenCount?: number; isOpen?: boolean } ) => {
			if ( action.type === 'NOTIFICATIONS_PANEL_TOGGLE' ) {
				isNotificationsOpen = ! isNotificationsOpen;
				onToggleNotifications?.();

				notificationsUnseenCount = 0;
				listeners.forEach( ( listener ) => listener() );
			}
			if ( action.type === 'NOTIFICATIONS_OPEN_SET' ) {
				isNotificationsOpen = action.isOpen ?? false;
				listeners.forEach( ( listener ) => listener() );
			}
			if ( action.type === 'NOTIFICATIONS_UNSEEN_COUNT_SET' ) {
				notificationsUnseenCount = action.unseenCount;
				listeners.forEach( ( listener ) => listener() );
			}
			return action;
		},
		subscribe: ( listener: () => void ) => {
			listeners.add( listener );
			return () => listeners.delete( listener );
		},
	} as unknown as StoreType;
}
