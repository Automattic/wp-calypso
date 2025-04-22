import { Card } from '@automattic/components';
import { Purchases } from '@automattic/data-stores';
import { DataViews, View } from '@wordpress/dataviews';
import { LocalizeProps } from 'i18n-calypso';
import { usePurchasesFieldDefinitions } from './hooks/use-field-definitions';

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
