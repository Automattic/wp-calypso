import React, { createContext, ReactNode } from 'react';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { default as usePlanUsageQuery } from './../../hooks/use-plan-usage-query';

type StatsGlobalValuesProviderProps = {
	children: ReactNode;
};

// Create a context for the provider
export const StatsGlobalValuesContext = createContext< boolean | undefined >( false );

// Create the provider component
export const StatsGlobalValuesProvider: React.FC< StatsGlobalValuesProviderProps > = ( {
	children,
} ) => {
	const siteId = useSelector( getSelectedSiteId );
	const { isPending, data: usageData } = usePlanUsageQuery( siteId );
	const isInternal = ! isPending && !! usageData?.is_internal;

	return (
		<StatsGlobalValuesContext.Provider value={ isInternal }>
			{ children }
		</StatsGlobalValuesContext.Provider>
	);
};
