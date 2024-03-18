import React, { createContext, ReactNode } from 'react';
import type { SiteSlug } from 'calypso/types';

interface PluginUpdateManagerContextProps {
	siteSlug: SiteSlug;
	siteHasEligiblePlugins: boolean;
	siteHasEligiblePluginsLoading: boolean;
}

const PluginUpdateManagerContext = createContext< PluginUpdateManagerContextProps >( {
	siteSlug: '',
	siteHasEligiblePlugins: true,
	siteHasEligiblePluginsLoading: true,
} );

const PluginUpdateManagerContextProvider = ( {
	siteSlug,
	siteHasEligiblePlugins,
	siteHasEligiblePluginsLoading,
	children,
}: PluginUpdateManagerContextProps & { children: ReactNode } ) => {
	return (
		<PluginUpdateManagerContext.Provider
			value={ {
				siteSlug,
				siteHasEligiblePlugins,
				siteHasEligiblePluginsLoading,
			} }
		>
			{ children }
		</PluginUpdateManagerContext.Provider>
	);
};

export { PluginUpdateManagerContext, PluginUpdateManagerContextProvider };
