import React from 'react';
import { useSelector } from 'react-redux';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPurchaseURLCallback } from '../get-purchase-url-callback';
import ProductCard from '../product-card';
import { Duration, QueryArgs, SelectorProduct } from '../types';
import { getTieredBackupProducts } from './get-tiered-products';

import './style.scss';

interface Props {
	duration: Duration;
	urlQueryArgs: QueryArgs;
	siteSlug?: string;
}

export const StorageTierUpgrade: React.FC< Props > = ( {
	duration,
	urlQueryArgs,
	siteSlug: siteSlugProp,
} ) => {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlugState = useSelector( ( state ) => getSelectedSiteSlug( state ) );
	const siteSlug = siteSlugProp || siteSlugState || '';
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const tieredBackupProducts = getTieredBackupProducts( duration );

	const noop = () => {
		// Do nothing
	};

	const createButtonURL = getPurchaseURLCallback( siteSlug, urlQueryArgs );

	return (
		<div className="storage-tier-upgrade">
			{ tieredBackupProducts.map( ( product: SelectorProduct ) => (
				<ProductCard
					item={ product }
					onClick={ noop }
					siteId={ siteId }
					currencyCode={ currencyCode }
					selectedTerm={ duration }
					isAligned={ false }
					featuredPlans={ [] }
					scrollCardIntoView={ noop }
					createButtonURL={ createButtonURL }
				/>
			) ) }
		</div>
	);
};
