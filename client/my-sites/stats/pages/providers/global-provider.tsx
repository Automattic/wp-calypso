import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { default as usePlanUsageQuery } from './../../hooks/use-plan-usage-query';

type StatsGlobalValuesProviderProps = {
	children: ReactNode;
};

// Create a context for the provider
export const StatsGlobalValuesContext = createContext< boolean | undefined >( undefined );

// Create the provider component
export const StatsGlobalValuesProvider: React.FC< StatsGlobalValuesProviderProps > = ( {
	children,
} ) => {
	const [ isInternal, setIsInternal ] = useState< boolean >( false );
	const siteId = useSelector( getSelectedSiteId );

	const { isFetching: isFetchingUsage, data: usageData } = usePlanUsageQuery( siteId );

	useEffect( () => {
		if ( ! isFetchingUsage ) {
			setIsInternal( ! isFetchingUsage && !! usageData?.is_internal );
		}
	}, [ isFetchingUsage, usageData ] );

	return (
		<StatsGlobalValuesContext.Provider value={ isInternal }>
			{ children }
		</StatsGlobalValuesContext.Provider>
	);
};
