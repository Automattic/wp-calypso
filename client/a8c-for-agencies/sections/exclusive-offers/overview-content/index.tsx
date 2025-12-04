import { Badge } from '@automattic/ui';
import {
	Card,
	CardBody,
	Button,
	__experimentalSpacer as Spacer,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ButtonStack } from 'calypso/dashboard/components/button-stack';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { filterOptions, partnerOffers } from './constants';
import type { PartnerOffer } from './types';
import type { View, Field } from '@wordpress/dataviews';

import './style.scss';

const initialView: View = {
	type: 'list',
	fields: [],
	search: '',
	filters: [],
	page: 1,
	perPage: 100,
};

function PartnerOfferCard( { item }: { item: PartnerOffer } ) {
	const dispatch = useDispatch();

	const offerType = filterOptions.offerTypes.find( ( option ) => option.value === item.offerType );

	const handleCTAClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_exclusive_offers_cta_click', {
				offer_id: item.id,
			} )
		);
	};

	const handleViewTermsClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_exclusive_offers_view_terms_click', {
				offer_id: item.id,
			} )
		);
	};

	return (
		<Card>
			<CardBody style={ { display: 'flex', flexDirection: 'column', height: '100%' } }>
				<VStack spacing={ 4 } style={ { flex: 1, justifyContent: 'flex-start' } }>
					<HStack>
						{ item.logo }
						{ offerType?.label && <Badge>{ offerType.label }</Badge> }
					</HStack>
					<VStack spacing={ 1 }>
						<Text size={ 13 } weight={ 500 }>
							{ item.title }
						</Text>
						<Text variant="muted" size={ 12 }>
							{ item.description }
						</Text>
					</VStack>
				</VStack>
				{ item.cta && (
					<ButtonStack
						style={ {
							marginTop: '24px',
							alignSelf: 'flex-start',
							justifyContent: 'flex-start',
							gap: '16px',
						} }
					>
						<Button variant="secondary" href={ item.cta.url } onClick={ handleCTAClick }>
							{ item.cta.label }
						</Button>
						<Button
							variant="link"
							href="https://automattic.com/for-agencies/program-incentives"
							target="_blank"
							onClick={ handleViewTermsClick }
						>
							{ __( 'View terms' ) }
						</Button>
					</ButtonStack>
				) }
			</CardBody>
		</Card>
	);
}

export default function PartnerOffersOverviewContent() {
	const [ view, setView ] = useState< View >( initialView );

	const fields: Field< PartnerOffer >[] = useMemo(
		() => [
			{
				id: 'title',
				getValue: ( { item } ) => item.title,
				enableGlobalSearch: true,
			},
			{
				id: 'description',
				getValue: ( { item } ) => item.description,
				enableGlobalSearch: true,
			},
			{
				id: 'product',
				label: __( 'Product' ),
				type: 'text',
				getValue: ( { item } ) => item.product,
				elements: filterOptions.products,
				filterBy: {
					operators: [ 'is' ],
				},
				enableSorting: false,
				enableHiding: true,
			},
			{
				id: 'offerType',
				label: __( 'Offer type' ),
				type: 'text',
				getValue: ( { item } ) => item.offerType,
				elements: filterOptions.offerTypes,
				filterBy: {
					operators: [ 'is' ],
				},
				enableSorting: false,
				enableHiding: true,
			},
			{
				id: 'productType',
				label: __( 'Product type' ),
				type: 'text',
				getValue: ( { item } ) => item.productType,
				elements: filterOptions.productTypes,
				filterBy: {
					operators: [ 'is' ],
				},
				enableSorting: false,
				enableHiding: true,
			},
		],
		[]
	);

	const { data: filteredData, paginationInfo } = useMemo(
		() => filterSortAndPaginate( partnerOffers, view, fields ),
		[ view, fields ]
	);

	return (
		<>
			<Spacer marginBottom={ 4 } style={ { maxWidth: '600px' } }>
				<Text size={ 15 }>
					{ __(
						'Discover exclusive offers, events, training, and tools from Automattic and our partners. Everything you need to help your agency grow and support your clients.'
					) }
				</Text>
			</Spacer>

			<DataViews< PartnerOffer >
				data={ partnerOffers }
				fields={ fields }
				view={ view }
				onChangeView={ setView }
				paginationInfo={ paginationInfo }
				defaultLayouts={ { list: {} } }
				search
			>
				<HStack justify="start" style={ { paddingBlock: '16px' } }>
					<DataViews.Search />
					<DataViews.FiltersToggle />
				</HStack>
				<DataViews.FiltersToggled className="exclusive-offers-filters" />
			</DataViews>
			<div className="exclusive-offers-cards">
				{ filteredData.map( ( item ) => (
					<PartnerOfferCard key={ item.id } item={ item } />
				) ) }
			</div>
		</>
	);
}
