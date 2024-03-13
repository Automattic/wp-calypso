import React, { createContext, ReactNode, useState } from 'react';
import type { SiteSlug } from 'calypso/types';

interface PluginUpdateManagerContextProps {
	siteSlug: SiteSlug;
}

interface PluginUpdateManagerContextState {
	siteHasEligiblePlugins: boolean;
	setSiteHasEligiblePlugins: ( siteHasEligiblePlugins: boolean ) => void;
}

const PluginUpdateManagerContext = createContext<
	PluginUpdateManagerContextProps & PluginUpdateManagerContextState
>( {
	siteSlug: '',
	siteHasEligiblePlugins: true,
	setSiteHasEligiblePlugins: () => {},
} );

const PluginUpdateManagerContextProvider = ( {
	siteSlug,
	children,
}: PluginUpdateManagerContextProps & { children: ReactNode } ) => {
	const [ siteHasEligiblePlugins, setSiteHasEligiblePlugins ] = useState( true );

	return (
		<PluginUpdateManagerContext.Provider
			value={ {
				siteSlug,
				siteHasEligiblePlugins,
				setSiteHasEligiblePlugins,
			} }
		>
			{ children }
		</PluginUpdateManagerContext.Provider>
	);
};

export { PluginUpdateManagerContext, PluginUpdateManagerContextProvider };
