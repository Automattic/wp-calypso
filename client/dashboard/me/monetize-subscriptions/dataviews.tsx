import { MonetizeSubscription } from '@automattic/api-core';
import { Fields } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import {
	MonetizeSubscriptionIcon,
	MonetizeSubscriptionTerms,
	MonetizeSubscriptionType,
} from './monetize-item';

export function useMonetizeFieldDefinitions() {
	return useMemo( () => {
		return getMonetizeFieldDefinitions();
	}, [] );
}

export function getMonetizeFieldDefinitions(): Fields< MonetizeSubscription > {
	const getPurchaseUrl = ( item: MonetizeSubscription ) => {
		const subscriptionId = item.ID;
		if ( ! subscriptionId ) {
			// eslint-disable-next-line no-console
			console.error( 'Cannot display manage purchase page for subscription without ID' );
			return;
		}
		return `/me/purchases/other/${ subscriptionId }`;
	};

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
					<a title={ __( 'Manage purchase' ) } href={ getPurchaseUrl( item ) }>
						<MonetizeSubscriptionIcon subscription={ item } />
					</a>
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
					<a title={ __( 'Manage purchase' ) } href={ getPurchaseUrl( item ) }>
						{ item.title }
					</a>
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
