import { TERM_ANNUALLY } from '@automattic/calypso-products';
import { ReactNode, useState } from 'react';
import * as React from 'react';
import { useSelector } from 'react-redux';
import QuerySiteProducts from 'calypso/components/data/query-site-products';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import Main from 'calypso/components/main';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { FootnotesList } from '../footnotes-list';
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
}

export const StoragePricing: React.FC< Props > = ( {
	defaultDuration = TERM_ANNUALLY,
	nav,
	header,
	footer,
	urlQueryArgs,
	siteSlug,
} ) => {
	const [ duration, setDuration ] = useState< Duration >( defaultDuration );
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );

	return (
		<>
			{ siteId && <QuerySitePurchases siteId={ siteId } /> }
			{ siteId && <QuerySiteProducts siteId={ siteId } /> }

			{ nav }
			<Main className="storage-pricing__main" wideLayout>
				{ header }
				<PlansFilterBar
					showDiscountMessage
					duration={ duration }
					onDurationChange={ setDuration }
				/>
				<StorageTierUpgrade
					duration={ duration }
					urlQueryArgs={ urlQueryArgs }
					siteSlug={ siteSlug }
				/>
				<FootnotesList />
				{ footer }
			</Main>
		</>
	);
};
