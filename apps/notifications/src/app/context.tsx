import { createContext, useContext, useMemo } from 'react';
import type { Client } from './types';

export type AppContextData = {
	client: Client | null;
	locale: string;
};

const AppContext = createContext< AppContextData >( {
	client: null,
	locale: 'en',
} );

export const AppProvider = ( {
	client,
	locale,
	children,
}: {
	client: Client | null;
	locale: string;
	children: React.ReactNode;
} ) => {
	const value = useMemo(
		() => ( {
			client,
			locale,
		} ),
		[ client, locale ]
	);

	return <AppContext.Provider value={ value }>{ children }</AppContext.Provider>;
};

export const useAppContext = () => useContext( AppContext );
