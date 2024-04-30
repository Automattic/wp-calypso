import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import { DATAVIEWS_TABLE } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import { DataViews } from 'calypso/components/dataviews';
import SiteSort from '../site-sort';
import PlanField, { AvailablePlans } from './plan-field';

import './style.scss';

export default function NeedSetupTable() {
	const translate = useTranslate();

	const fields = [
		{
			id: 'site',
			header: (
				<SiteSort isSortable={ false } columnKey="site">
					{ translate( 'Site' ).toUpperCase() }
				</SiteSort>
			),
			getValue: () => '-',
			render: ( { item }: { item: AvailablePlans } ): ReactNode => {
				return <PlanField { ...item } />;
			},
			enableHiding: false,
			enableSorting: false,
		},
	];

	return (
		<DataViews
			data={ [
				{
					name: translate( 'WordPress.com Creator' ),
					available: 1,
				},
			] }
			paginationInfo={ { totalItems: 1, totalPages: 1 } }
			fields={ fields }
			view={ {
				filters: [],
				sort: {
					field: '',
					direction: 'asc',
				},
				type: DATAVIEWS_TABLE,
				perPage: 1,
				page: 1,
				hiddenFields: [],
				layout: {},
			} }
			search={ false }
			supportedLayouts={ [ 'table' ] }
			actions={ [] }
			isLoading={ false }
		/>
	);
}
