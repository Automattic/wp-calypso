import { TERM_ANNUALLY } from '@automattic/calypso-products';
import React, { ReactNode, useState } from 'react';
import { useSelector } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteProducts from 'calypso/components/data/query-site-products';
import Main from 'calypso/components/main';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import PlansFilterBar from '../plans-filter-bar';
import { StorageTierUpgrade } from '../storage-tier-upgrade';
import { QueryArgs, Duration } from '../types';

interface Props {
	defaultDuration: Duration;
	header: ReactNode;
	footer: ReactNode;
	urlQueryArgs: QueryArgs;
	siteSlug?: string;
}

export const StoragePricing: React.FC< Props > = ( {
	defaultDuration = TERM_ANNUALLY,
	header,
	footer,
	urlQueryArgs,
	siteSlug,
} ) => {
	const [ duration, setDuration ] = useState< Duration >( defaultDuration );
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );

	return (
		<Main className="storage-pricing__main">
			{ header }
			<PlansFilterBar showDiscountMessage duration={ duration } onDurationChange={ setDuration } />
			<StorageTierUpgrade
				duration={ duration }
				urlQueryArgs={ urlQueryArgs }
				siteSlug={ siteSlug }
			/>
			{ footer }
			{ siteId ? <QuerySiteProducts siteId={ siteId } /> : <QueryProductsList type="jetpack" /> }
		</Main>
	);
};
