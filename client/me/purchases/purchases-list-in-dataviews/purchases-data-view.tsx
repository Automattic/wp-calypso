import { Card } from '@automattic/components';
import { Purchases } from '@automattic/data-stores';
import { DataViews, View, filterSortAndPaginate } from '@wordpress/dataviews';
import { LocalizeProps } from 'i18n-calypso';
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
	titleField: 'site',
	fields: [ 'product', 'status', 'payment-method' ],
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
	const [ currentView, setView ] = useState( purchasesDataView );
	const purchasesDataFields = usePurchasesFieldDefinitions( purchasesDataView.fields );

	const { data: adjustedPurchases, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( purchases, currentView, purchasesDataFields );
	}, [ purchases, currentView, purchasesDataFields ] );

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
				actions={ undefined }
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
