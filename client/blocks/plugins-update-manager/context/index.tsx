import React, { createContext, ReactNode, useState } from 'react';
import type { SiteSlug } from 'calypso/types';

interface PluginUpdateManagerContextProps {
	siteSlug: SiteSlug;
	isEligibleForFeature: boolean;
}

interface PluginUpdateManagerContextState {
	hasUserManagedPlugins: boolean;
	setHasUserManagedPlugins: ( hasUserManagedPlugins: boolean ) => void;
}

const PluginUpdateManagerContext = createContext<
	PluginUpdateManagerContextProps & PluginUpdateManagerContextState
>( {
	siteSlug: '',
	isEligibleForFeature: false,
	hasUserManagedPlugins: true,
	setHasUserManagedPlugins: () => {},
} );

const PluginUpdateManagerContextProvider = ( {
	siteSlug,
	children,
	isEligibleForFeature,
}: PluginUpdateManagerContextProps & { children: ReactNode } ) => {
	const [ hasUserManagedPlugins, setHasUserManagedPlugins ] = useState( true );

	return (
		<PluginUpdateManagerContext.Provider
			value={ { siteSlug, isEligibleForFeature, hasUserManagedPlugins, setHasUserManagedPlugins } }
		>
			{ children }
		</PluginUpdateManagerContext.Provider>
	);
};

export { PluginUpdateManagerContext, PluginUpdateManagerContextProvider };
