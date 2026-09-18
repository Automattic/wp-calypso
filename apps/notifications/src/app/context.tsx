import { createContext, useContext, useMemo } from 'react';
import type { Client } from './types';

// Where Calypso is served from the widget's own origin: wordpress.com itself,
// or the widgets.wp.com iframe embedded in it. A host served from anywhere else
// (the Dashboard) passes its own builder.
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
	// Builds a URL to a Calypso path. Only the host knows where Calypso lives:
	// it is a different origin from the Dashboard, and a configured one in
	// development and preview builds.
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
