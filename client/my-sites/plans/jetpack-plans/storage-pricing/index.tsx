import config from '@automattic/calypso-config';
import { TERM_ANNUALLY } from '@automattic/calypso-products';
import { ReactNode, useState } from 'react';
import * as React from 'react';
import QueryIntroOffers from 'calypso/components/data/query-intro-offers';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteProducts from 'calypso/components/data/query-site-products';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import Main from 'calypso/components/main';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import PlansFilterBar from '../plans-filter-bar';
import { StorageTierUpgrade } from '../storage-tier-upgrade';
import { QueryArgs, Duration } from '../types';

import './style.scss';

interface Props {
	defaultDuration: Duration;
	nav: ReactNode;
	header: ReactNode;
	footer: ReactNode;
	urlQueryArgs: QueryArgs;
	siteSlug?: string;
	locale?: string;
}

export const StoragePricing: React.FC< Props > = ( {
	defaultDuration = TERM_ANNUALLY,
	nav,
	header,
	footer,
	urlQueryArgs,
	siteSlug,
	locale,
} ) => {
	const [ duration, setDuration ] = useState< Duration >( defaultDuration );
	const siteId = useSelector( getSelectedSiteId );
	const showAnnualPlansOnly = config.isEnabled( 'jetpack/pricing-page-annual-only' );

	const filterBar = React.useMemo(
		() =>
			showAnnualPlansOnly ? null : (
				<PlansFilterBar
					showDiscountMessage
					duration={ duration }
					onDurationChange={ setDuration }
				/>
			),
		[ duration, showAnnualPlansOnly ]
	);

	return (
		<>
			<QueryProductsList type="jetpack" />
			<QueryIntroOffers siteId={ siteId ?? 'none' } />
			{ siteId && <QuerySitePurchases siteId={ siteId } /> }
			{ siteId && <QuerySiteProducts siteId={ siteId } /> }

			{ nav }
			<Main className="storage-pricing__main" wideLayout>
				{ header }
				{ filterBar }
				<StorageTierUpgrade
					duration={ duration }
					urlQueryArgs={ urlQueryArgs }
					siteSlug={ siteSlug }
					locale={ locale }
				/>
			</Main>
			{ footer }
		</>
	);
};
