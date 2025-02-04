import React, { createContext, ReactNode } from 'react';
import type { SiteSlug } from 'calypso/types';

interface PluginUpdateManagerContextProps {
	siteSlug: SiteSlug;
}

const PluginUpdateManagerContext = createContext< PluginUpdateManagerContextProps >( {
	siteSlug: '',
} );

const PluginUpdateManagerContextProvider = ( {
	siteSlug,
	children,
}: PluginUpdateManagerContextProps & { children: ReactNode } ) => {
	return (
		<PluginUpdateManagerContext.Provider
			value={ {
				siteSlug,
			} }
		>
			{ children }
		</PluginUpdateManagerContext.Provider>
	);
};

export { PluginUpdateManagerContext, PluginUpdateManagerContextProvider };
