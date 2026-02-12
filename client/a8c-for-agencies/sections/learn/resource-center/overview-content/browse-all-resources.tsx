import {
	__experimentalHeading as Heading,
	__experimentalSpacer as Spacer,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import ResourceCard from './resource-card';
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
	onOpenVideoModal: ( resource: ResourceItem ) => void;
}

export default function BrowseAllResources( {
	resources,
	onOpenVideoModal,
}: BrowseAllResourcesProps ) {
	const [ view, setView ] = useState< View >( initialView );

	// Build filter options dynamically from available resources
	const filterOptions = useMemo( () => {
		const products = new Set< string >();
		const resourceTypes = new Set< string >();

		resources.forEach( ( resource ) => {
			if ( resource.relatedProduct ) {
				products.add( resource.relatedProduct );
			}
			if ( resource.resourceType ) {
				resourceTypes.add( resource.resourceType );
			}
		} );

		return {
			products: Array.from( products ).map( ( value ) => ( {
				value,
				label: value,
			} ) ),
			resourceTypes: Array.from( resourceTypes ).map( ( value ) => ( {
				value,
				label: value,
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
		],
		[ filterOptions ]
	);

	const { data: filteredData, paginationInfo } = useMemo(
		() => filterSortAndPaginate( resources, view, fields ),
		[ resources, view, fields ]
	);

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
				getItemId={ ( item ) => String( item.id ) }
				search
			>
				<HStack justify="start" style={ { paddingBlock: '16px' } }>
					<DataViews.Search />
					<DataViews.FiltersToggle />
				</HStack>
				<DataViews.FiltersToggled className="resource-center-filters" />
			</DataViews>
			{ filteredData.length > 0 ? (
				<div className="resource-center-cards resource-center-browse-all-resources">
					{ filteredData.map( ( item ) => (
						<ResourceCard
							key={ item.id }
							resource={ item }
							onOpenVideoModal={ onOpenVideoModal }
							showLogo
							tracksEventName="calypso_a4a_resource_center_browse_cta_click"
						/>
					) ) }
				</div>
			) : (
				<Spacer marginTop={ 2 } marginBottom={ 4 }>
					<VStack className="resource-center-empty-results" spacing={ 2 }>
						<Text weight={ 500 }>{ __( "We couldn't find any resources related to that." ) }</Text>
						<Text>
							{ __(
								'Try adjusting your search or exploring other resources to help your agency grow.'
							) }
						</Text>
					</VStack>
				</Spacer>
			) }
		</>
	);
}
