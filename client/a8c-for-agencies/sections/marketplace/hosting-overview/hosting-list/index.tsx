import { SiteDetails } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import FilterSearch from 'calypso/a8c-for-agencies/components/filter-search';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useProductAndPlans from '../../hooks/use-product-and-plans';
import { getCheapestPlan } from '../../lib/hosting';
import ListingSection from '../../listing-section';
import HostingCard from '../hosting-card';

import './style.scss';

interface Props {
	selectedSite?: SiteDetails | null;
}

export default function HostingList( { selectedSite }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

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

	if ( isLoadingProducts ) {
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
				{ cheapestPressablePlan && <HostingCard plan={ cheapestPressablePlan } /> }
				{ cheapestWPCOMPlan && <HostingCard plan={ cheapestWPCOMPlan } /> }
			</ListingSection>
		</div>
	);
}
