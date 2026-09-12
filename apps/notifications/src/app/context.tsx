import { createContext, useContext, useMemo } from 'react';
import type { Client } from './types';

export type AppContextData = {
	client: Client | null;
	locale: string;
	// Whether the host lets the user change which views the panel shows. This package
	// also builds standalone for widgets.wp.com, where there is no Calypso config to
	// read a feature flag from, so the host has to tell us — and off is the safe default.
	isViewSettingsEnabled: boolean;
};

const AppContext = createContext< AppContextData >( {
	client: null,
	locale: 'en',
	isViewSettingsEnabled: false,
} );

export const AppProvider = ( {
	client,
	locale,
	isViewSettingsEnabled = false,
	children,
}: {
	client: Client | null;
	locale: string;
	isViewSettingsEnabled?: boolean;
	children: React.ReactNode;
} ) => {
	const value = useMemo(
		() => ( {
			client,
			locale,
			isViewSettingsEnabled,
		} ),
		[ client, locale, isViewSettingsEnabled ]
	);

	return <AppContext.Provider value={ value }>{ children }</AppContext.Provider>;
};

export const useAppContext = () => useContext( AppContext );
