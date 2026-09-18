import { createContext, useContext, useMemo } from 'react';
import type { Client } from './types';

const sameOriginWpcomUrl = ( path: string ) => {
	const host =
		document.location.host === 'widgets.wp.com' ? 'wordpress.com' : document.location.host;

	return `${ document.location.protocol }//${ host }${ path }`;
};

export type AppContextData = {
	client: Client | null;
	locale: string;
	isViewSettingsEnabled: boolean;
	onPreferenceChange: ( key: string, value: unknown ) => Promise< unknown >;
	wpcomUrl: ( path: string ) => string;
};

const AppContext = createContext< AppContextData >( {
	client: null,
	locale: 'en',
	isViewSettingsEnabled: false,
	onPreferenceChange: () => Promise.resolve(),
	wpcomUrl: sameOriginWpcomUrl,
} );

export const AppProvider = ( {
	client,
	locale,
	isViewSettingsEnabled = false,
	onPreferenceChange = () => Promise.resolve(),
	wpcomUrl = sameOriginWpcomUrl,
	children,
}: {
	client: Client | null;
	locale: string;
	isViewSettingsEnabled?: boolean;
	onPreferenceChange?: ( key: string, value: unknown ) => Promise< unknown >;
	wpcomUrl?: ( path: string ) => string;
	children: React.ReactNode;
} ) => {
	const value = useMemo(
		() => ( {
			client,
			locale,
			isViewSettingsEnabled,
			onPreferenceChange,
			wpcomUrl,
		} ),
		[ client, locale, isViewSettingsEnabled, onPreferenceChange, wpcomUrl ]
	);

	return <AppContext.Provider value={ value }>{ children }</AppContext.Provider>;
};

export const useAppContext = () => useContext( AppContext );
