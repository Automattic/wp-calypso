import page from '@automattic/calypso-router';
import { Gridicon, Card } from '@automattic/components';
import { Purchases } from '@automattic/data-stores';
import { DESKTOP_BREAKPOINT } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import { DataViews, View, filterSortAndPaginate } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import { MembershipSubscription } from 'calypso/lib/purchases/types';
import {
	usePurchasesFieldDefinitions,
	useMembershipsFieldDefinitions,
} from './hooks/use-field-definitions';

const purchasesDesktopFields = [ 'site', 'product', 'status', 'payment-method' ];
const purchasesMobileFields = [ 'product' ];
export const purchasesDataView: View = {
	type: 'table',
	page: 1,
	perPage: 5,
	titleField: 'purchase-id',
	showTitle: false,
	fields: purchasesDesktopFields,
	sort: {
		field: 'product',
		direction: 'desc',
	},
	layout: {},
};

export function PurchasesDataViews( { purchases }: { purchases: Purchases.Purchase[] } ) {
	const isDesktop = useBreakpoint( DESKTOP_BREAKPOINT );
	const translate = useTranslate();
	const [ currentView, setView ] = useState( purchasesDataView );
	// Hide fields at mobile width
	useEffect( () => {
		if ( isDesktop && currentView.fields === purchasesMobileFields ) {
			setView( { ...currentView, fields: purchasesDesktopFields } );
			return;
		}
		if ( ! isDesktop && currentView.fields === purchasesDesktopFields ) {
			setView( { ...currentView, fields: purchasesMobileFields } );
			return;
		}
	}, [ isDesktop, currentView, setView ] );
	const purchasesDataFields = usePurchasesFieldDefinitions( purchasesDataView.fields );

	const { data: adjustedPurchases, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( purchases, currentView, purchasesDataFields );
	}, [ purchases, currentView, purchasesDataFields ] );

	const actions = useMemo(
		() => [
			{
				id: 'manage-purchase',
				label: translate( 'Manage this purchase', { textOnly: true } ),
				isPrimary: true,
				icon: <Gridicon icon="chevron-right" />,
				isEligible: ( item: Purchases.Purchase ) => Boolean( item.domain && item.id ),
				callback: ( items: Purchases.Purchase[] ) => {
					const siteUrl = items[ 0 ].domain;
					const subscriptionId = items[ 0 ].id;
					if ( ! siteUrl ) {
						// eslint-disable-next-line no-console
						console.error( 'Cannot display manage purchase page for subscription without site' );
						return;
					}
					if ( ! subscriptionId ) {
						// eslint-disable-next-line no-console
						console.error( 'Cannot display manage purchase page for subscription without ID' );
						return;
					}
					page( `/me/purchases/${ siteUrl }/${ subscriptionId }` );
				},
			},
		],
		[ translate ]
	);

	const getItemId = ( item: Purchases.Purchase ) => {
		return item.id.toString();
	};
	return (
		<Card id="purchases-list" className="section-content" tagName="section">
			<DataViews
				data={ adjustedPurchases }
				fields={ purchasesDataFields }
				view={ currentView }
				onChangeView={ setView }
				defaultLayouts={ { table: {} } }
				actions={ actions }
				getItemId={ getItemId }
				paginationInfo={ paginationInfo }
			/>
		</Card>
	);
}

const membershipsDesktopFields = [ 'site', 'product', 'status' ];
const membershipsMobileFields = [ 'product' ];
export const membershipDataView: View = {
	type: 'table',
	page: 1,
	perPage: 5,
	titleField: 'purchase-id',
	showTitle: false,
	fields: membershipsDesktopFields,
	sort: {
		field: 'product',
		direction: 'desc',
	},
	layout: {},
};

export function MembershipsDataViews( { memberships }: { memberships: MembershipSubscription[] } ) {
	const membershipsDataFields = useMembershipsFieldDefinitions();
	const [ currentView, setView ] = useState( membershipDataView );
	const isDesktop = useBreakpoint( DESKTOP_BREAKPOINT );
	const translate = useTranslate();

	// Hide fields at mobile width
	useEffect( () => {
		if ( isDesktop && currentView.fields === membershipsMobileFields ) {
			setView( { ...currentView, fields: membershipsDesktopFields } );
			return;
		}
		if ( ! isDesktop && currentView.fields === membershipsDesktopFields ) {
			setView( { ...currentView, fields: membershipsMobileFields } );
			return;
		}
	}, [ isDesktop, currentView, setView ] );

	const actions = useMemo(
		() => [
			{
				id: 'manage-purchase',
				label: translate( 'Manage this purchase', { textOnly: true } ),
				isPrimary: true,
				icon: <Gridicon icon="chevron-right" />,
				isEligible: ( item: MembershipSubscription ) => Boolean( item.ID ),
				callback: ( items: MembershipSubscription[] ) => {
					const subscriptionId = items[ 0 ].ID;
					if ( ! subscriptionId ) {
						// eslint-disable-next-line no-console
						console.error( 'Cannot display manage purchase page for subscription without ID' );
						return;
					}
					page( `/me/purchases/other/${ subscriptionId }` );
				},
			},
		],
		[ translate ]
	);

	const { data: adjustedMemberships, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( memberships, currentView, membershipsDataFields );
	}, [ memberships, currentView, membershipsDataFields ] );

	const getItemId = ( item: MembershipSubscription ) => {
		return item.ID;
	};
	return (
		<Card id="purchases-list" className="section-content" tagName="section">
			<DataViews
				data={ adjustedMemberships }
				fields={ membershipsDataFields }
				view={ currentView }
				onChangeView={ setView }
				defaultLayouts={ { table: {} } }
				actions={ actions }
				getItemId={ getItemId }
				paginationInfo={ paginationInfo }
			/>
		</Card>
	);
}
