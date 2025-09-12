import { MembershipSubscription } from '@automattic/api-core';
import { Fields } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { MembershipIcon, MembershipTerms, MembershipType } from './membership-item';

export function useMembershipsFieldDefinitions() {
	return useMemo( () => {
		return getMembershipsFieldDefinitions();
	}, [] );
}

export function getMembershipsFieldDefinitions(): Fields< MembershipSubscription > {
	const getPurchaseUrl = ( item: MembershipSubscription ) => {
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
			getValue: ( { item }: { item: MembershipSubscription } ) => {
				return item.site_id + ' ' + item.site_title + ' ' + item.site_url;
			},
			// Render the site icon
			render: ( { item }: { item: MembershipSubscription } ) => {
				return (
					<a title={ __( 'Manage purchase' ) } href={ getPurchaseUrl( item ) }>
						<MembershipIcon subscription={ item } />
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
			getValue: ( { item }: { item: MembershipSubscription } ) => {
				return item.title + ' ' + item.site_title + ' ' + item.site_url;
			},
			render: ( { item }: { item: MembershipSubscription } ) => {
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
			getValue: ( { item }: { item: MembershipSubscription } ) => {
				return item.title + ' ' + item.site_title + ' ' + item.site_url;
			},
			render: ( { item }: { item: MembershipSubscription } ) => {
				return <MembershipType subscription={ item } />;
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
			getValue: ( { item }: { item: MembershipSubscription } ) => {
				return item.end_date ?? '';
			},
			render: ( { item }: { item: MembershipSubscription } ) => {
				return <MembershipTerms subscription={ item } />;
			},
		},
	];
}
