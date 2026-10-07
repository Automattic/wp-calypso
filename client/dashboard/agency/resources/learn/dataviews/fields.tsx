import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import {
	getAudienceLabel,
	getContentTypeLabel,
	getFormatLabel,
	getProductLabel,
	getStageLabel,
} from '../lib/labels';
import { ResourceListProduct, ResourceListTitle } from '../resource-list';
import type { SelectResource } from '../types';
import type { AgencyEnablementResource } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

/**
 * Fields for filtering the library and for the list layout's columns. The
 * grid renders its own cards, so only the list uses the `render` callbacks.
 */
export function useResourceFields(
	resources: AgencyEnablementResource[],
	onSelectResource: SelectResource
) {
	return useMemo( (): Field< AgencyEnablementResource >[] => {
		// Only offer values that occur in the data, per the v2 contract.
		const toElements = (
			getValue: ( resource: AgencyEnablementResource ) => string,
			getLabel: ( value: string ) => string
		) =>
			Array.from( new Set( resources.map( getValue ) ) ).map( ( value ) => ( {
				value,
				label: getLabel( value ),
			} ) );

		const filterField = (
			id: string,
			label: string,
			getValue: ( resource: AgencyEnablementResource ) => string,
			getLabel: ( value: string ) => string
		): Field< AgencyEnablementResource > => ( {
			id,
			label,
			type: 'text',
			getValue: ( { item } ) => getValue( item ),
			elements: toElements( getValue, getLabel ),
			filterBy: { operators: [ 'is', 'isAny' ] },
			enableSorting: false,
			enableHiding: true,
		} );

		return [
			{
				id: 'name',
				label: __( 'Title' ),
				getValue: ( { item } ) => item.name,
				render: ( { item } ) => (
					<ResourceListTitle resource={ item } onSelect={ onSelectResource } />
				),
				enableGlobalSearch: true,
				enableSorting: false,
				enableHiding: false,
			},
			{
				id: 'description',
				label: __( 'Description' ),
				getValue: ( { item } ) => item.description,
				enableGlobalSearch: true,
				enableSorting: false,
			},
			{
				id: 'featured',
				label: __( 'Top resources' ),
				type: 'text',
				getValue: ( { item } ) => ( item.is_featured ? 'featured' : '' ),
				elements: [ { value: 'featured', label: __( 'Top resource' ) } ],
				filterBy: { operators: [ 'is' ] },
				enableSorting: false,
				enableHiding: true,
			},
			{
				...filterField( 'product', __( 'Product' ), ( item ) => item.product, getProductLabel ),
				render: ( { item } ) => <ResourceListProduct resource={ item } />,
			},
			filterField( 'audience', __( 'Audience' ), ( item ) => item.audience, getAudienceLabel ),
			filterField(
				'content_type',
				__( 'Content type' ),
				( item ) => item.content_type,
				getContentTypeLabel
			),
			filterField( 'format', __( 'Format' ), ( item ) => item.format, getFormatLabel ),
			{
				...filterField( 'stage', __( 'Stage' ), ( item ) => item.stage, getStageLabel ),
				// Set by the stage toggle rather than the filters menu.
				filterBy: false,
			},
		];
	}, [ resources, onSelectResource ] );
}
