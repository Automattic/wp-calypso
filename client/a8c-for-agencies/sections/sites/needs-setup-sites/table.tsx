import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import { DATAVIEWS_TABLE } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import { DataViews } from 'calypso/components/dataviews';
import SiteSort from '../site-sort';
import PlanField, { AvailablePlans } from './plan-field';
import type { Field } from '@wordpress/dataviews';

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

	const fields: Field< AvailablePlans >[] = [
		{
			id: 'site',
			// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
			label: (
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
		<DataViews< AvailablePlans >
			data={ isLoading ? [] : availablePlans }
			paginationInfo={ { totalItems: 1, totalPages: 1 } }
			fields={ fields }
			view={ {
				type: DATAVIEWS_TABLE,
				perPage: 1,
				page: 1,
			} }
			onChangeView={ () => {} }
			search={ false }
			defaultLayouts={ { table: {} } }
			actions={ [] }
			isLoading={ false }
			getItemId={ ( item: AvailablePlans ) => item.name }
		/>
	);
}
