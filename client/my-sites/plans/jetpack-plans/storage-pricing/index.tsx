import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteProducts from 'calypso/components/data/query-site-products';
import Main from 'calypso/components/main';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import PlansFilterBar from '../plans-filter-bar';
import { StorageTierUpgrade } from '../storage-tier-upgrade';
import { StoragePricingProps, Duration } from '../types';

export const StoragePricing: React.FC< StoragePricingProps > = ( {
	defaultDuration,
	header,
	footer,
} ) => {
	const [ duration, setDuration ] = useState< Duration >( defaultDuration );
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );

	return (
		<Main className="storage-pricing__main">
			{ header }
			<PlansFilterBar showDiscountMessage duration={ duration } onDurationChange={ setDuration } />
			<StorageTierUpgrade />
			{ footer }
			{ siteId ? <QuerySiteProducts siteId={ siteId } /> : <QueryProductsList type="jetpack" /> }
		</Main>
	);
};
