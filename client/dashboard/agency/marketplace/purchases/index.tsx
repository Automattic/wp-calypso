import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo } from 'react';
import { usePersistentView } from '../../../app/hooks/use-persistent-view';
import { useLocale } from '../../../app/locale';
import { DataViews, DataViewsCard } from '../../../components/dataviews';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { DEFAULT_VIEW, getActions, getFields, getItemId } from './dataviews';
import { fetchAgencyLicenses } from './mock-data';

import './style.scss';

const agencyLicensesQuery = () => ( {
	queryKey: [ 'marketplace-purchases', 'mock-licenses' ],
	queryFn: fetchAgencyLicenses,
} );

export default function MarketplacePurchases() {
	const locale = useLocale();
	const { createSuccessNotice } = useDispatch( noticesStore );

	const { data: licenses = [], isLoading } = useQuery( agencyLicensesQuery() );

	const { view, updateView, resetView } = usePersistentView( {
		slug: 'marketplace-purchases',
		defaultView: DEFAULT_VIEW,
	} );

	const fields = useMemo( () => getFields( { locale } ), [ locale ] );

	const actions = useMemo(
		() => getActions( ( message ) => createSuccessNotice( message, { type: 'snackbar' } ) ),
		[ createSuccessNotice ]
	);

	const { data: filteredLicenses, paginationInfo } = useMemo(
		() => filterSortAndPaginate( licenses, view, fields ),
		[ licenses, view, fields ]
	);

	return (
		<PageLayout
			size="large"
			header={
				<PageHeader
					title={ __( 'Purchases' ) }
					description={ __(
						'Review the licenses you’ve issued, assign them to client sites, and manage renewals.'
					) }
					actions={
						<Button variant="primary" __next40pxDefaultSize href="/marketplace/products">
							{ __( 'Issue new license' ) }
						</Button>
					}
				/>
			}
		>
			<DataViewsCard>
				<DataViews
					isLoading={ isLoading }
					data={ filteredLicenses }
					fields={ fields }
					view={ view }
					onChangeView={ updateView }
					onReset={ resetView }
					defaultLayouts={ { table: {} } }
					actions={ actions }
					getItemId={ getItemId }
					paginationInfo={ paginationInfo }
				/>
			</DataViewsCard>
		</PageLayout>
	);
}
