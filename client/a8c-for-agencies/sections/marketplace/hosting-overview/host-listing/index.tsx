import { SiteDetails } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import FilterSearch from 'calypso/a8c-for-agencies/components/filter-search';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useProductAndPlans from '../../hooks/use-product-and-plans';
import ListingSection from '../../listing-section';

import './style.scss';

interface Props {
	selectedSite?: SiteDetails | null;
}

export default function HostListing( { selectedSite }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ productSearchQuery, setProductSearchQuery ] = useState< string >( '' );

	const { isLoadingProducts } = useProductAndPlans( {
		selectedSite,
		productSearchQuery,
	} );

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
			<div className="host-listing">
				<div className="host-listing__placeholder" />
			</div>
		);
	}

	return (
		<div className="host-listing">
			<div className="host-listing__actions">
				<FilterSearch label={ translate( 'Search products' ) } onSearch={ onProductSearch } />
			</div>

			<ListingSection
				title={ translate( 'Hosting' ) }
				description={ translate(
					'Mix and match powerful security, performance, and growth tools for your sites.'
				) }
			>
				test
			</ListingSection>
		</div>
	);
}
