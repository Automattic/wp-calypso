import { MonetizeSubscription } from '@automattic/api-core';
import { Link } from '@tanstack/react-router';
import { Fields } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import {
	MonetizeSubscriptionIcon,
	MonetizeSubscriptionTerms,
	MonetizeSubscriptionType,
} from './monetize-item';
import { getMonetizeSubscriptionUrl } from './urls';

export function useMonetizeFieldDefinitions() {
	return useMemo( () => {
		return getMonetizeFieldDefinitions();
	}, [] );
}

export function getMonetizeFieldDefinitions(): Fields< MonetizeSubscription > {
	return [
		{
			id: 'site',
			label: __( 'Site' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: false,
			enableHiding: false,
			filterBy: false,
			getValue: ( { item }: { item: MonetizeSubscription } ) => {
				return item.site_id + ' ' + item.site_title + ' ' + item.site_url;
			},
			// Render the site icon
			render: ( { item }: { item: MonetizeSubscription } ) => {
				return (
					<Link title={ __( 'Manage purchase' ) } to={ getMonetizeSubscriptionUrl( item.ID ) }>
						<MonetizeSubscriptionIcon subscription={ item } />
					</Link>
				);
			},
		},
		{
			id: 'product',
			label: __( 'Product' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			filterBy: false,
			getValue: ( { item }: { item: MonetizeSubscription } ) => {
				return item.title + ' ' + item.site_title + ' ' + item.site_url;
			},
			render: ( { item }: { item: MonetizeSubscription } ) => {
				return (
					<Link title={ __( 'Manage purchase' ) } to={ getMonetizeSubscriptionUrl( item.ID ) }>
						{ item.title }
					</Link>
				);
			},
		},
		{
			id: 'description',
			label: __( 'Product Description' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			filterBy: false,
			getValue: ( { item }: { item: MonetizeSubscription } ) => {
				return item.title + ' ' + item.site_title + ' ' + item.site_url;
			},
			render: ( { item }: { item: MonetizeSubscription } ) => {
				return <MonetizeSubscriptionType subscription={ item } />;
			},
		},
		{
			id: 'status',
			label: __( 'Status' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: false,
			enableHiding: false,
			filterBy: false,
			getValue: ( { item }: { item: MonetizeSubscription } ) => {
				return item.end_date ?? '';
			},
			render: ( { item }: { item: MonetizeSubscription } ) => {
				return <MonetizeSubscriptionTerms subscription={ item } />;
			},
		},
	];
}
