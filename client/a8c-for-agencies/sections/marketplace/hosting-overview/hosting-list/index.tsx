import { SiteDetails } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import FilterSearch from 'calypso/a8c-for-agencies/components/filter-search';
import useFetchLicenseCounts from 'calypso/a8c-for-agencies/data/purchases/use-fetch-license-counts';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useProductAndPlans from '../../hooks/use-product-and-plans';
import { getCheapestPlan } from '../../lib/hosting';
import ListingSection from '../../listing-section';
import { getAllPressablePlans } from '../../pressable-overview/lib/get-pressable-plan';
import HostingCard from '../hosting-card';

import './style.scss';

interface Props {
	selectedSite?: SiteDetails | null;
}

export default function HostingList( { selectedSite }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	// limiting time to 2 minutes to avoid multiple requests
	const { data, isFetching: isFetchingCounts } = useFetchLicenseCounts( 120000 );
	const hasPressablePlan = useMemo(
		() => getAllPressablePlans().some( ( key ) => data?.products?.[ key ]?.[ 'not_revoked' ] > 0 ),
		[ data ]
	);

	const [ productSearchQuery, setProductSearchQuery ] = useState< string >( '' );

	const { isLoadingProducts, pressablePlans } = useProductAndPlans( {
		selectedSite,
		productSearchQuery,
	} );

	const cheapestPressablePlan = useMemo(
		() => ( pressablePlans.length ? getCheapestPlan( pressablePlans ) : null ),
		[ pressablePlans ]
	);

	const cheapestWPCOMPlan = null; // FIXME: Need to fetch from API

	const onProductSearch = useCallback(
		( value: string ) => {
			setProductSearchQuery( value );
			dispatch(
				recordTracksEvent( 'calypso_a4a_marketplace_hosting_overview_search_submit', { value } )
			);
		},
		[ dispatch ]
	);

	if ( isLoadingProducts || isFetchingCounts ) {
		return (
			<div className="hosting-list">
				<div className="hosting-list__placeholder" />
			</div>
		);
	}

	return (
		<div className="hosting-list">
			<div className="hosting-list__actions">
				<FilterSearch label={ translate( 'Search products' ) } onSearch={ onProductSearch } />
			</div>

			<ListingSection
				title={ translate( 'Hosting' ) }
				description={ translate(
					'Mix and match powerful security, performance, and growth tools for your sites.'
				) }
				isTwoColumns
			>
				{ cheapestPressablePlan && (
					<HostingCard plan={ cheapestPressablePlan } pressableOwnership={ hasPressablePlan } />
				) }
				{ cheapestWPCOMPlan && <HostingCard plan={ cheapestWPCOMPlan } /> }
			</ListingSection>
		</div>
	);
}
