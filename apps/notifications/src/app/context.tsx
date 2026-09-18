import { createContext, useContext, useMemo } from 'react';
import { sameOriginWpcomUrl } from '../shared/wpcom-url';
import type { Client } from './types';

export type AppContextData = {
	client: Client | null;
	locale: string;
	isViewSettingsEnabled: boolean;
	onPreferenceChange: ( key: string, value: unknown ) => Promise< unknown >;
	getWpcomUrl: ( path: string ) => string;
};

const AppContext = createContext< AppContextData >( {
	client: null,
	locale: 'en',
	isViewSettingsEnabled: false,
	onPreferenceChange: () => Promise.resolve(),
	getWpcomUrl: sameOriginWpcomUrl,
} );

export const AppProvider = ( {
	client,
	locale,
	isViewSettingsEnabled = false,
	onPreferenceChange = () => Promise.resolve(),
	getWpcomUrl = sameOriginWpcomUrl,
	children,
}: {
	client: Client | null;
	locale: string;
	isViewSettingsEnabled?: boolean;
	onPreferenceChange?: ( key: string, value: unknown ) => Promise< unknown >;
	getWpcomUrl?: ( path: string ) => string;
	children: React.ReactNode;
} ) => {
	const value = useMemo(
		() => ( {
			client,
			locale,
			isViewSettingsEnabled,
			onPreferenceChange,
			getWpcomUrl,
		} ),
		[ client, locale, isViewSettingsEnabled, onPreferenceChange, getWpcomUrl ]
	);

	return <AppContext.Provider value={ value }>{ children }</AppContext.Provider>;
};

export const useAppContext = () => useContext( AppContext );
