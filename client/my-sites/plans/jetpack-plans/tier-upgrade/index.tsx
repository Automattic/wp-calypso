import { TERM_ANNUALLY } from '@automattic/calypso-products';
import React from 'react';
import { useSelector } from 'react-redux';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ProductCard from '../product-card';
import { SelectorProduct } from '../types';
import { getTieredBackupProducts } from './get-tiered-products';

export const TierUpgrade = () => {
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const tieredBackupProducts = getTieredBackupProducts( 'yearly' );

	const noop = () => {
		// Do nothing
	};

	return (
		<div>
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
					createButtonURL={ () => '' }
				/>
			) ) }
		</div>
	);
};
