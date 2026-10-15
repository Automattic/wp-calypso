import { createContext, useContext, useMemo } from 'react';
import type { Client } from './types';

export type AppContextData = {
	client: Client | null;
	locale: string;
	isViewSettingsEnabled: boolean;
	onPreferenceChange: ( key: string, value: unknown ) => Promise< unknown >;
};

const AppContext = createContext< AppContextData >( {
	client: null,
	locale: 'en',
	isViewSettingsEnabled: false,
	onPreferenceChange: () => Promise.resolve(),
} );

export const AppProvider = ( {
	client,
	locale,
	isViewSettingsEnabled = false,
	onPreferenceChange = () => Promise.resolve(),
	children,
}: {
	client: Client | null;
	locale: string;
	isViewSettingsEnabled?: boolean;
	onPreferenceChange?: ( key: string, value: unknown ) => Promise< unknown >;
	children: React.ReactNode;
} ) => {
	const value = useMemo(
		() => ( {
			client,
			locale,
			isViewSettingsEnabled,
			onPreferenceChange,
		} ),
		[ client, locale, isViewSettingsEnabled, onPreferenceChange ]
	);

	return <AppContext.Provider value={ value }>{ children }</AppContext.Provider>;
};

export const useAppContext = () => useContext( AppContext );
