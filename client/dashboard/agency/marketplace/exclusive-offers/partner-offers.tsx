import { Badge } from '@automattic/ui';
import {
	Button,
	__experimentalGrid as Grid,
	__experimentalSpacer as Spacer,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody } from '../../../components/card';
import { filterOptions, partnerOffers } from './constants';
import type { PartnerOffer, RecordTracksEvent } from './types';
import type { View, Field } from '@wordpress/dataviews';

const VIEW_TERMS_URL = 'https://automattic.com/for-agencies/program-incentives';

const initialView: View = {
	type: 'list',
	fields: [],
	search: '',
	filters: [],
	page: 1,
	perPage: 100,
};

function PartnerOfferCard( {
	item,
	recordTracksEvent,
	onCtaClick,
}: {
	item: PartnerOffer;
	recordTracksEvent: RecordTracksEvent;
	onCtaClick?: ( offer: PartnerOffer ) => void;
} ) {
	const offerType = filterOptions.offerTypes.find( ( option ) => option.value === item.offerType );

	const handleCTAClick = () => {
		onCtaClick?.( item );
		recordTracksEvent( 'calypso_a4a_exclusive_offers_cta_click', { offer_id: item.id } );
	};

	const handleViewTermsClick = () => {
		recordTracksEvent( 'calypso_a4a_exclusive_offers_view_terms_click', { offer_id: item.id } );
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
						{ /* TODO: non-external URLs are classic A4A marketplace paths that 404 until the dashboard Marketplace exists. */ }
						<Button
							variant="secondary"
							href={ item.cta.url }
							target={ item.cta.external ? '_blank' : undefined }
							onClick={ handleCTAClick }
						>
							{ item.cta.label }
						</Button>
						<Button
							variant="link"
							href={ item.termsUrl ?? VIEW_TERMS_URL }
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

export default function PartnerOffers( {
	recordTracksEvent = () => {},
	onCtaClick,
}: {
	recordTracksEvent?: RecordTracksEvent;
	onCtaClick?: ( offer: PartnerOffer ) => void;
} ) {
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

	const { data: filteredData } = useMemo(
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
				paginationInfo={ { totalItems: partnerOffers.length, totalPages: 1 } }
				defaultLayouts={ { list: {} } }
				search
			>
				<HStack justify="start" style={ { paddingBlock: '16px' } }>
					<DataViews.Search />
					<DataViews.FiltersToggle />
				</HStack>
				<Spacer marginBottom={ 4 }>
					<DataViews.FiltersToggled />
				</Spacer>
			</DataViews>
			<Grid templateColumns="repeat( auto-fill, minmax( 280px, 1fr ) )" gap={ 8 }>
				{ filteredData.map( ( item ) => (
					<PartnerOfferCard
						key={ item.id }
						item={ item }
						recordTracksEvent={ recordTracksEvent }
						onCtaClick={ onCtaClick }
					/>
				) ) }
			</Grid>
		</>
	);
}
