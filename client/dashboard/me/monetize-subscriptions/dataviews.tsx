import { formatCurrency } from '@automattic/number-formatters';
import { Fields } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { MembershipIcon, MembershipSiteLink } from './membership-item';
import { MembershipSubscription } from './types';
import { createInterpolateElement } from '@wordpress/element';

export function useMembershipsFieldDefinitions() {
	return useMemo( () => {
		return getMembershipsFieldDefinitions();
	}, [] );
}

export const MembershipTerms = ( { subscription }: { subscription: MembershipSubscription } ) => {
	const moment = useLocalizedMoment();

	if ( subscription.end_date === null ) {
		return <>{ __( 'Never expires' ) }</>;
	}

	const renewText =
		subscription.renew_interval === null
			? // eslint-disable-next-line @wordpress/i18n-translator-comments
			  __( 'Expires on %(date)s' )
			: // eslint-disable-next-line @wordpress/i18n-translator-comments
			  __( 'Renews at %(amount)s on %(date)s' );
	return (
		<>
			{ sprintf( renewText, {
				date: moment( subscription.end_date ).format( 'LL' ),
			} ) }
		</>
	);
};

export const MembershipType = ( { subscription }: { subscription: MembershipSubscription } ) => {
	if ( subscription.end_date === null ) {
		return createInterpolateElement( __( 'Purchased from <MembershipSiteLink/>' ), {
			MembershipSiteLink: <MembershipSiteLink subscription={ subscription } />,
		} );
	}
	return createInterpolateElement( __( 'Subscription to <MembershipSiteLink/>' ), {
		MembershipSiteLink: <MembershipSiteLink subscription={ subscription } />,
	} );
};

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
					<div className="membership-item__information purchase-item__information">
						<div className="membership-item__title purchase-item__title">
							<a title={ __( 'Manage purchase' ) } href={ getPurchaseUrl( item ) }>
								{ item.title }
							</a>
						</div>
					</div>
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
				return (
					<div className="membership-item__information purchase-item__information">
						<div className="membership-item__purchase-type purchase-item__purchase-type">
							<MembershipType subscription={ item } />
						</div>
					</div>
				);
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
				return (
					<div className="membership-item__status purchase-item__status">
						<MembershipTerms subscription={ item } />
					</div>
				);
			},
		},
	];
}
