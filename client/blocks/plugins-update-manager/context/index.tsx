import React, { createContext, ReactNode } from 'react';
import type { SiteSlug } from 'calypso/types';

interface PluginUpdateManagerContextProps {
	siteSlug: SiteSlug;
	isEligibleForFeature: boolean;
}

const PluginUpdateManagerContext = createContext< PluginUpdateManagerContextProps >( {
	siteSlug: '',
	isEligibleForFeature: false,
} );

const PluginUpdateManagerContextProvider = ( {
	siteSlug,
	children,
	isEligibleForFeature,
}: PluginUpdateManagerContextProps & { children: ReactNode } ) => (
	<PluginUpdateManagerContext.Provider value={ { siteSlug, isEligibleForFeature } }>
		{ children }
	</PluginUpdateManagerContext.Provider>
);

export { PluginUpdateManagerContext, PluginUpdateManagerContextProvider };
