import { Provider as ReduxProvider } from 'react-redux';
import { setSessionLocale } from '../locale/session-locale';

type StoreType = Parameters< typeof ReduxProvider >[ 0 ][ 'store' ];

type Action = {
	type?: string;
	unseenCount?: number;
	isOpen?: boolean;
	localeSlug?: string;
};

type Thunk = (
	dispatch: ( action: Action | Thunk ) => unknown,
	getState: () => unknown
) => unknown;

// Fake Redux store so child components using connect() (e.g. Notifications,
// QuickLanguageSwitcher) don't crash. It intercepts the specific actions the
// dashboard handles and supports thunks so Calypso's `setLocale` action runs.
export function createOmnibarStore( {
	onToggleNotifications,
	initialLocaleSlug = 'en',
}: {
	onToggleNotifications?: () => void;
	initialLocaleSlug?: string;
} = {} ): StoreType {
	const listeners = new Set< () => void >();
	let notificationsUnseenCount: number | undefined;
	let isNotificationsOpen = false;
	let localeSlug = initialLocaleSlug;

	const getState = () => ( {
		ui: { section: false, isNotificationsOpen, language: { localeSlug } },
		notificationsUnseenCount,
	} );

	const notify = () => listeners.forEach( ( listener ) => listener() );

	const dispatch = ( action: Action | Thunk ): unknown => {
		// Support thunks (e.g. Calypso's `setLocale`, which switches the locale
		// before dispatching LOCALE_SET).
		if ( typeof action === 'function' ) {
			return action( dispatch, getState );
		}

		if ( action.type === 'NOTIFICATIONS_PANEL_TOGGLE' ) {
			isNotificationsOpen = ! isNotificationsOpen;
			onToggleNotifications?.();

			notificationsUnseenCount = 0;
			notify();
		}
		if ( action.type === 'NOTIFICATIONS_OPEN_SET' ) {
			isNotificationsOpen = action.isOpen ?? false;
			notify();
		}
		if ( action.type === 'NOTIFICATIONS_UNSEEN_COUNT_SET' ) {
			notificationsUnseenCount = action.unseenCount;
			notify();
		}
		if ( action.type === 'LOCALE_SET' ) {
			localeSlug = action.localeSlug ?? 'en';
			// Drive the dashboard's locale from the switcher's selection.
			setSessionLocale( localeSlug );
			notify();
		}
		return action;
	};

	return {
		getState,
		dispatch,
		subscribe: ( listener: () => void ) => {
			listeners.add( listener );
			return () => listeners.delete( listener );
		},
	} as unknown as StoreType;
}
