import { isEnabled } from '@automattic/calypso-config';
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

	const { isLoadingProducts, pressablePlans, wpcomPlans } = useProductAndPlans( {
		selectedSite,
		productSearchQuery,
	} );

	const isWPCOMOptionEnabled = isEnabled( 'a8c-for-agencies/wpcom-creator-plan-purchase-flow' );

	const cheapestPressablePlan = useMemo(
		() => ( pressablePlans.length ? getCheapestPlan( pressablePlans ) : null ),
		[ pressablePlans ]
	);

	const cheapestWPCOMPlan = useMemo(
		() => ( isWPCOMOptionEnabled && wpcomPlans.length ? getCheapestPlan( wpcomPlans ) : null ),
		[ isWPCOMOptionEnabled, wpcomPlans ]
	);

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
				{ cheapestWPCOMPlan && <HostingCard plan={ cheapestWPCOMPlan } /> }

				{ cheapestPressablePlan && (
					<HostingCard plan={ cheapestPressablePlan } pressableOwnership={ hasPressablePlan } />
				) }
			</ListingSection>
		</div>
	);
}
