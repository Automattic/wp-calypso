import { TERM_ANNUALLY } from '@automattic/calypso-products';
import React from 'react';
import { useSelector } from 'react-redux';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPurchaseURLCallback } from '../get-purchase-url-callback';
import ProductCard from '../product-card';
import { QueryArgs, SelectorProduct } from '../types';
import { getTieredBackupProducts } from './get-tiered-products';

import './style.scss';

interface Props {
	urlQueryArgs: QueryArgs;
	siteSlug?: string;
}

export const StorageTierUpgrade: React.FC< Props > = ( {
	urlQueryArgs,
	siteSlug: siteSlugProp,
} ) => {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlugState = useSelector( ( state ) => getSelectedSiteSlug( state ) );
	const siteSlug = siteSlugProp || siteSlugState || '';
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const tieredBackupProducts = getTieredBackupProducts( TERM_ANNUALLY );

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
					selectedTerm={ TERM_ANNUALLY }
					isAligned={ false }
					featuredPlans={ [] }
					scrollCardIntoView={ noop }
					createButtonURL={ createButtonURL }
				/>
			) ) }
		</div>
	);
};
