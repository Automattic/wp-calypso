import { Reader } from '@automattic/data-stores';
import React, { useMemo } from 'react';
import { SiteSubscriptionContext } from 'calypso/reader/contexts/SiteSubscriptionContext';
import { toSiteSubscription } from './utils';

type SiteSubscriptionProviderProps = {
	value: Reader.SiteSubscription;
	children: React.ReactNode;
};

export const SiteSubscriptionRowProvider: React.FC< SiteSubscriptionProviderProps > = ( {
	value,
	children,
} ) => {
	const siteSubscriptionContext = useMemo( () => {
		return {
			data: toSiteSubscription( value ),
			isLoading: false,
		};
	}, [ value ] );
	return (
		<SiteSubscriptionContext.Provider value={ siteSubscriptionContext }>
			{ children }
		</SiteSubscriptionContext.Provider>
	);
};
