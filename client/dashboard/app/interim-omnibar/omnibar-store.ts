import { Provider as ReduxProvider } from 'react-redux';

type StoreType = Parameters< typeof ReduxProvider >[ 0 ][ 'store' ];

// Fake Redux store so child components using connect() (e.g. Notifications) don't crash.
// Intercepts specific actions so the dashboard can handle them.
export function createOmnibarStore( onToggleNotifications?: () => void ): StoreType {
	return {
		getState: () => ( { ui: { section: false, isNotificationsOpen: false } } ),
		dispatch: ( action: { type: string } ) => {
			if ( action.type === 'NOTIFICATIONS_PANEL_TOGGLE' ) {
				onToggleNotifications?.();
			}
			return action;
		},
		subscribe: () => () => {},
	} as unknown as StoreType;
}
