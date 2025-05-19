import { Card } from '@automattic/components';
import { Purchases } from '@automattic/data-stores';
import { DataViews, View } from '@wordpress/dataviews';
import { LocalizeProps } from 'i18n-calypso';
import { MembershipSubscription } from 'calypso/lib/purchases/types';
import {
	usePurchasesFieldDefinitions,
	useMembershipsFieldDefinitions,
} from './hooks/use-field-definitions';

export const purchasesDataView = {
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
} as View;

export function PurchasesDataViews( props: {
	purchases: Purchases.Purchase[];
	translate: LocalizeProps[ 'translate' ];
} ) {
	const { purchases } = props;
	const onChangeView = () => {
		return;
	};

	const getItemId = ( item: Purchases.Purchase ) => {
		return item.id.toString();
	};
	const purchasesDataFields = usePurchasesFieldDefinitions();
	return (
		<Card id="purchases-list" className="section-content" tagName="section">
			<DataViews
				data={ purchases }
				fields={ purchasesDataFields }
				view={ purchasesDataView }
				onChangeView={ onChangeView }
				defaultLayouts={ { table: {} } }
				actions={ undefined }
				getItemId={ getItemId }
				paginationInfo={ { totalItems: 100, totalPages: 10 } }
			/>
		</Card>
	);
}

export const membershipDataView = {
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
} as View;

export function MembershipsDataViews( props: {
	memberships: MembershipSubscription[];
	translate: LocalizeProps[ 'translate' ];
} ) {
	const { memberships } = props;
	const onChangeView = () => {
		return;
	};

	const getItemId = ( item: MembershipSubscription ) => {
		return item.ID;
	};
	const membershipsDataFields = useMembershipsFieldDefinitions();
	return (
		<Card id="purchases-list" className="section-content" tagName="section">
			<DataViews
				data={ memberships }
				fields={ membershipsDataFields }
				view={ membershipDataView }
				onChangeView={ onChangeView }
				defaultLayouts={ { table: {} } }
				actions={ undefined }
				getItemId={ getItemId }
				paginationInfo={ { totalItems: 100, totalPages: 10 } }
			/>
		</Card>
	);
}
