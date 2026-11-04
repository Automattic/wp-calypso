import { createContext, useContext, useMemo } from 'react';
import type { Client } from './types';

export type AppContextData = {
	client: Client | null;
	locale: string;
	isViewSettingsEnabled: boolean;
	isSimplifiedNoteEnabled: boolean;
	onPreferenceChange: ( key: string, value: unknown ) => Promise< unknown >;
	onOpenFullView?: () => void;
};

const AppContext = createContext< AppContextData >( {
	client: null,
	locale: 'en',
	isViewSettingsEnabled: false,
	isSimplifiedNoteEnabled: false,
	onPreferenceChange: () => Promise.resolve(),
} );

export const AppProvider = ( {
	client,
	locale,
	isViewSettingsEnabled = false,
	isSimplifiedNoteEnabled = false,
	onPreferenceChange = () => Promise.resolve(),
	onOpenFullView,
	children,
}: {
	client: Client | null;
	locale: string;
	isViewSettingsEnabled?: boolean;
	isSimplifiedNoteEnabled?: boolean;
	onPreferenceChange?: ( key: string, value: unknown ) => Promise< unknown >;
	onOpenFullView?: () => void;
	children: React.ReactNode;
} ) => {
	const value = useMemo(
		() => ( {
			client,
			locale,
			isViewSettingsEnabled,
			isSimplifiedNoteEnabled,
			onPreferenceChange,
			onOpenFullView,
		} ),
		[
			client,
			locale,
			isViewSettingsEnabled,
			isSimplifiedNoteEnabled,
			onPreferenceChange,
			onOpenFullView,
		]
	);

	return <AppContext.Provider value={ value }>{ children }</AppContext.Provider>;
};

export const useAppContext = () => useContext( AppContext );
