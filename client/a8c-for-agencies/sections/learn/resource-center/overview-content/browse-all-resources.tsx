import {
	Card,
	CardBody,
	Button,
	__experimentalText as Text,
	__experimentalHeading as Heading,
	__experimentalSpacer as Spacer,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ButtonStack } from 'calypso/dashboard/components/button-stack';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { filterOptions, resourceItems } from './constants';
import type { ResourceItem } from './types';
import type { View, Field } from '@wordpress/dataviews';

const initialView: View = {
	type: 'list',
	fields: [],
	search: '',
	filters: [],
	page: 1,
	perPage: 100,
};

function ResourceItemCard( { item }: { item: ResourceItem } ) {
	const dispatch = useDispatch();

	const handleCTAClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_resource_center_cta_click', {
				resource_id: item.id,
			} )
		);
	};

	const handleViewTermsClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_resource_center_view_terms_click', {
				resource_id: item.id,
			} )
		);
	};

	return (
		<Card>
			<CardBody style={ { display: 'flex', flexDirection: 'column', height: '100%' } }>
				<VStack spacing={ 4 } style={ { flex: 1, justifyContent: 'flex-start' } }>
					<HStack>{ item.logo }</HStack>
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

export default function BrowseAllResources() {
	const [ view, setView ] = useState< View >( initialView );

	const fields: Field< ResourceItem >[] = useMemo(
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
				id: 'resourceType',
				label: __( 'Resource type' ),
				type: 'text',
				getValue: ( { item } ) => item.resourceType,
				elements: filterOptions.resourceTypes,
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
		() => filterSortAndPaginate( resourceItems, view, fields ),
		[ view, fields ]
	);

	return (
		<>
			<Spacer marginBottom={ 2 }>
				<Heading level={ 2 } weight={ 500 } size={ 20 }>
					{ __( 'Browse all resources' ) }
				</Heading>
			</Spacer>
			<DataViews< ResourceItem >
				data={ resourceItems }
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
				<DataViews.FiltersToggled className="resource-center-filters" />
			</DataViews>
			<div className="resource-center-cards">
				{ filteredData.map( ( item ) => (
					<ResourceItemCard key={ item.id } item={ item } />
				) ) }
			</div>
		</>
	);
}
