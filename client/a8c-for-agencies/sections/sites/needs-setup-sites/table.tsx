import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import { DATAVIEWS_TABLE } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import { DataViews } from 'calypso/components/dataviews';
import SiteSort from '../site-sort';
import PlanField, { AvailablePlans } from './plan-field';

import './style.scss';

type Props = {
	availablePlans: AvailablePlans[];
	isLoading?: boolean;
	provisioning?: boolean;
	onCreateSite: ( id: number ) => void;
	onMigrateSite: ( id: number ) => void;
};

export default function NeedSetupTable( {
	availablePlans,
	isLoading,
	provisioning,
	onCreateSite,
	onMigrateSite,
}: Props ) {
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
				if ( isLoading ) {
					return <TextPlaceholder />;
				}

				return (
					<PlanField
						{ ...item }
						provisioning={ provisioning }
						onCreateSite={ onCreateSite }
						onMigrateSite={ onMigrateSite }
					/>
				);
			},
			enableHiding: false,
			enableSorting: false,
		},
	];

	return (
		<DataViews
			data={ isLoading ? [ {} ] : availablePlans }
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
