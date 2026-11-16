import { createContext, useContext, useMemo } from 'react';
import type { Client } from './types';

export type AppContextData = {
	client: Client | null;
	locale: string;
	isViewSettingsEnabled: boolean;
	isMarkAsUnreadEnabled: boolean;
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
	children,
}: {
	client: Client | null;
	locale: string;
	isViewSettingsEnabled?: boolean;
	isMarkAsUnreadEnabled?: boolean;
	children: React.ReactNode;
} ) => {
	const value = useMemo(
		() => ( {
			client,
			locale,
			isViewSettingsEnabled,
			isMarkAsUnreadEnabled,
		} ),
		[ client, locale, isViewSettingsEnabled, isMarkAsUnreadEnabled ]
	);

	return <AppContext.Provider value={ value }>{ children }</AppContext.Provider>;
};

export const useAppContext = () => useContext( AppContext );
