import { createContext, useContext, useMemo } from 'react';
import type { Client } from './types';

export type AppContextData = {
	client: Client | null;
	locale: string;
	isViewSettingsEnabled: boolean;
	isMarkAsUnreadEnabled: boolean;
	onOpenFullView?: () => void;
};

const AppContext = createContext< AppContextData >( {
	client: null,
	locale: 'en',
	isViewSettingsEnabled: false,
	isMarkAsUnreadEnabled: false,
} );

export const AppProvider = ( {
	client,
	locale,
	isViewSettingsEnabled = false,
	isMarkAsUnreadEnabled = false,
	onOpenFullView,
	children,
}: {
	client: Client | null;
	locale: string;
	isViewSettingsEnabled?: boolean;
	isMarkAsUnreadEnabled?: boolean;
	onOpenFullView?: () => void;
	children: React.ReactNode;
} ) => {
	const value = useMemo(
		() => ( {
			client,
			locale,
			isViewSettingsEnabled,
			isMarkAsUnreadEnabled,
			onOpenFullView,
		} ),
		[ client, locale, isViewSettingsEnabled, isMarkAsUnreadEnabled, onOpenFullView ]
	);

	return <AppContext.Provider value={ value }>{ children }</AppContext.Provider>;
};

export const useAppContext = () => useContext( AppContext );
