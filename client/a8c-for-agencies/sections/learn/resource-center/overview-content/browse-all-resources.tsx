import {
	Card,
	CardBody,
	Button,
	Spinner,
	__experimentalText as Text,
	__experimentalHeading as Heading,
	__experimentalSpacer as Spacer,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
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

interface BrowseAllResourcesProps {
	resources: ResourceItem[];
	isLoading: boolean;
}

function ResourceItemCard( { item }: { item: ResourceItem } ) {
	const dispatch = useDispatch();

	const handleCTAClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_resource_center_browse_cta_click', {
				resource_id: item.id,
				resource_name: item.name,
			} )
		);
	};

	return (
		<Card>
			<CardBody style={ { display: 'flex', flexDirection: 'column', height: '100%' } }>
				<VStack spacing={ 4 } style={ { flex: 1, justifyContent: 'flex-start' } }>
					{ item.logo && <HStack>{ item.logo }</HStack> }
					<VStack spacing={ 1 }>
						<Text size={ 13 } weight={ 500 }>
							{ item.title || item.name }
						</Text>
						<Text variant="muted" size={ 12 }>
							{ item.description }
						</Text>
					</VStack>
				</VStack>
				{ item.cta && (
					<Button
						variant="secondary"
						href={ item.cta.url }
						target="_blank"
						onClick={ handleCTAClick }
						style={ { marginTop: '24px', alignSelf: 'flex-start' } }
					>
						{ item.cta.label }
					</Button>
				) }
			</CardBody>
		</Card>
	);
}

export default function BrowseAllResources( { resources, isLoading }: BrowseAllResourcesProps ) {
	const [ view, setView ] = useState< View >( initialView );

	// Build filter options dynamically from available resources
	const filterOptions = useMemo( () => {
		const products = new Set< string >();
		const resourceTypes = new Set< string >();
		const formats = new Set< string >();

		resources.forEach( ( resource ) => {
			if ( resource.relatedProduct ) {
				products.add( resource.relatedProduct );
			}
			if ( resource.resourceType ) {
				resourceTypes.add( resource.resourceType );
			}
			if ( resource.format ) {
				formats.add( resource.format );
			}
		} );

		return {
			products: Array.from( products ).map( ( value ) => ( {
				value,
				label: value.charAt( 0 ).toUpperCase() + value.slice( 1 ),
			} ) ),
			resourceTypes: Array.from( resourceTypes ).map( ( value ) => ( {
				value,
				label: value.charAt( 0 ).toUpperCase() + value.slice( 1 ),
			} ) ),
			formats: Array.from( formats ).map( ( value ) => ( {
				value,
				label: value.charAt( 0 ).toUpperCase() + value.slice( 1 ),
			} ) ),
		};
	}, [ resources ] );

	const fields: Field< ResourceItem >[] = useMemo(
		() => [
			{
				id: 'name',
				getValue: ( { item } ) => item.name,
				enableGlobalSearch: true,
			},
			{
				id: 'description',
				getValue: ( { item } ) => item.description,
				enableGlobalSearch: true,
			},
			{
				id: 'relatedProduct',
				label: __( 'Product' ),
				type: 'text',
				getValue: ( { item } ) => item.relatedProduct,
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
				id: 'format',
				label: __( 'Format' ),
				type: 'text',
				getValue: ( { item } ) => item.format,
				elements: filterOptions.formats,
				filterBy: {
					operators: [ 'is' ],
				},
				enableSorting: false,
				enableHiding: true,
			},
		],
		[ filterOptions ]
	);

	const { data: filteredData, paginationInfo } = useMemo(
		() => filterSortAndPaginate( resources, view, fields ),
		[ resources, view, fields ]
	);

	if ( isLoading ) {
		return (
			<>
				<Spacer marginBottom={ 2 }>
					<Heading level={ 2 } weight={ 500 } size={ 20 }>
						{ __( 'Browse all resources' ) }
					</Heading>
				</Spacer>
				<div style={ { textAlign: 'center', padding: '40px 0' } }>
					<Spinner />
				</div>
			</>
		);
	}

	if ( resources.length === 0 ) {
		return (
			<>
				<Spacer marginBottom={ 2 }>
					<Heading level={ 2 } weight={ 500 } size={ 20 }>
						{ __( 'Browse all resources' ) }
					</Heading>
				</Spacer>
				<Text variant="muted">{ __( 'No resources available at this time.' ) }</Text>
			</>
		);
	}

	return (
		<>
			<Spacer marginBottom={ 2 }>
				<Heading level={ 2 } weight={ 500 } size={ 20 }>
					{ __( 'Browse all resources' ) }
				</Heading>
			</Spacer>
			<DataViews< ResourceItem >
				data={ resources }
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
