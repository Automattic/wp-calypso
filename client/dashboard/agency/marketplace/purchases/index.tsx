import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState } from 'react';
import { usePersistentView } from '../../../app/hooks/use-persistent-view';
import { useLocale } from '../../../app/locale';
import { DataViews, DataViewsCard } from '../../../components/dataviews';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { DEFAULT_VIEW, getActions, getFields, getItemId } from './dataviews';
import { fetchAgencyLicenses, mockSites } from './mock-data';
import type { AgencyLicense, AgencySite } from './mock-data';

import './style.scss';

const agencyLicensesQuery = () => ( {
	queryKey: [ 'marketplace-purchases', 'mock-licenses' ],
	queryFn: fetchAgencyLicenses,
} );

export default function MarketplacePurchases() {
	const locale = useLocale();
	const { createSuccessNotice } = useDispatch( noticesStore );

	const { data: fetchedLicenses = [], isLoading } = useQuery( agencyLicensesQuery() );

	// Prototype-only: overlay assignment changes on the fetched data so the
	// assign flow is demoable without a real mutation.
	const [ overrides, setOverrides ] = useState< Record< number, Partial< AgencyLicense > > >( {} );
	const licenses = useMemo(
		() =>
			fetchedLicenses.map( ( license ) =>
				overrides[ license.licenseId ] ? { ...license, ...overrides[ license.licenseId ] } : license
			),
		[ fetchedLicenses, overrides ]
	);

	const { view, updateView, resetView } = usePersistentView( {
		slug: 'marketplace-purchases',
		defaultView: DEFAULT_VIEW,
	} );

	const fields = useMemo( () => getFields( { locale } ), [ locale ] );

	const actions = useMemo(
		() =>
			getActions( {
				onNotice: ( message ) => createSuccessNotice( message, { type: 'snackbar' } ),
				sites: mockSites,
				onAssign: ( licenseId: number, site: AgencySite ) => {
					setOverrides( ( current ) => ( {
						...current,
						[ licenseId ]: {
							status: 'assigned',
							siteUrl: site.url,
							blogId: site.blogId,
							attachedAt: new Date().toISOString(),
						},
					} ) );
					createSuccessNotice(
						sprintf(
							/* translators: %s: site URL */
							__( 'License assigned to %s.' ),
							site.url
						),
						{ type: 'snackbar' }
					);
				},
			} ),
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
