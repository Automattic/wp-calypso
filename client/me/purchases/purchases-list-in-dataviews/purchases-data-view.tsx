import page from '@automattic/calypso-router';
import { Gridicon, Card } from '@automattic/components';
import { Purchases } from '@automattic/data-stores';
import { DataViews, View, filterSortAndPaginate } from '@automattic/dataviews';
import { LocalizeProps, useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { MembershipSubscription } from 'calypso/lib/purchases/types';
import {
	usePurchasesFieldDefinitions,
	useMembershipsFieldDefinitions,
} from './hooks/use-field-definitions';

export const purchasesDataView: View = {
	type: 'table',
	page: 1,
	perPage: 5,
	titleField: 'purchase-id',
	showTitle: false,
	fields: [ 'site', 'product', 'status', 'payment-method' ],
	sort: {
		field: 'site',
		direction: 'desc',
	},
	layout: {},
};

export function PurchasesDataViews( props: {
	purchases: Purchases.Purchase[];
	translate: LocalizeProps[ 'translate' ];
} ) {
	const { purchases } = props;
	const translate = useTranslate();
	const [ currentView, setView ] = useState( purchasesDataView );
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
				callback: ( items: Purchases.Purchase[] ) => {
					const siteUrl = items[ 0 ].domain;
					const subscriptionId = items[ 0 ].id;
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

export const membershipDataView: View = {
	type: 'table',
	page: 1,
	perPage: 5,
	titleField: 'site',
	fields: [ 'product', 'status' ],
	sort: {
		field: 'site',
		direction: 'desc',
	},
	layout: {},
};

export function MembershipsDataViews( props: {
	memberships: MembershipSubscription[];
	translate: LocalizeProps[ 'translate' ];
} ) {
	const { memberships } = props;
	const membershipsDataFields = useMembershipsFieldDefinitions();
	const [ currentView, setView ] = useState( purchasesDataView );

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
				actions={ undefined }
				getItemId={ getItemId }
				paginationInfo={ paginationInfo }
			/>
		</Card>
	);
}
