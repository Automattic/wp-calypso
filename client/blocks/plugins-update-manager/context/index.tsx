import React, { createContext, ReactNode, useState } from 'react';
import type { SiteSlug } from 'calypso/types';

interface PluginUpdateManagerContextProps {
	siteSlug: SiteSlug;
	isEligibleForFeature: boolean;
}

interface PluginUpdateManagerContextState {
	siteHasEligiblePlugins: boolean;
	setSiteHasEligiblePlugins: ( siteHasEligiblePlugins: boolean ) => void;
}

const PluginUpdateManagerContext = createContext<
	PluginUpdateManagerContextProps & PluginUpdateManagerContextState
>( {
	siteSlug: '',
	isEligibleForFeature: false,
	siteHasEligiblePlugins: true,
	setSiteHasEligiblePlugins: () => {},
} );

const PluginUpdateManagerContextProvider = ( {
	siteSlug,
	children,
	isEligibleForFeature,
}: PluginUpdateManagerContextProps & { children: ReactNode } ) => {
	const [ siteHasEligiblePlugins, setSiteHasEligiblePlugins ] = useState( true );

	return (
		<PluginUpdateManagerContext.Provider
			value={ {
				siteSlug,
				isEligibleForFeature,
				siteHasEligiblePlugins,
				setSiteHasEligiblePlugins,
			} }
		>
			{ children }
		</PluginUpdateManagerContext.Provider>
	);
};

export { PluginUpdateManagerContext, PluginUpdateManagerContextProvider };
