import { activeAgencyQuery, paginatedJetpackAgencyLicensesQuery } from '@automattic/api-queries';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { usePersistentView } from '../../../app/hooks/use-persistent-view';
import { useLocale } from '../../../app/locale';
import { PerformanceTrackerStop } from '../../../app/performance-tracking';
import { marketplacePurchasesRoute } from '../../../app/router/agency';
import { DataViews, DataViewsCard, DataViewsEmptyStateLayout } from '../../../components/dataviews';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import RouterLinkButton from '../../../components/router-link-button';
import { DEFAULT_CONFIG, recordViewChanges } from '../../../sites/dataviews/views';
import { OWNER_ROLE } from '../../team/constants';
import { DEFAULT_VIEW, getLicenseFields, getLicenseId, toFetchOptions } from './dataviews';
import type { JetpackLicense } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

export default function MarketplacePurchases() {
	const locale = useLocale();
	const { recordTracksEvent } = useAnalytics();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;
	const isAgencyOwner = agency?.user?.role === OWNER_ROLE;
	const currentSearchParams = marketplacePurchasesRoute.useSearch();

	const { view, updateView, resetView } = usePersistentView( {
		slug: 'marketplace-purchases',
		defaultView: DEFAULT_VIEW,
		queryParams: currentSearchParams,
	} );

	const { data, isLoading, isPlaceholderData } = useQuery( {
		...paginatedJetpackAgencyLicensesQuery( agencyId, toFetchOptions( view ) ),
		enabled: agencyId > 0,
		placeholderData: keepPreviousData,
	} );
	const fields = useMemo(
		() => getLicenseFields( { locale, isAgencyOwner } ),
		[ locale, isAgencyOwner ]
	);
	const handleViewChange = ( nextView: View ) => {
		recordViewChanges(
			view,
			nextView,
			recordTracksEvent,
			'calypso_dashboard_marketplace_purchases'
		);
		updateView( nextView );
	};

	const paginationInfo = {
		totalItems: data?.total_items ?? 0,
		totalPages: data?.total_pages ?? 1,
	};

	const isFiltered = Boolean( view.search ) || ( view.filters?.length ?? 0 ) > 0;

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Purchases' ) }
					description={ __(
						'Review the licenses you’ve issued, assign them to client sites, and manage renewals.'
					) }
					actions={
						<RouterLinkButton
							to="/marketplace/products"
							variant="primary"
							onClick={ () => recordTracksEvent( 'calypso_a4a_license_list_issue_license_click' ) }
						>
							{ __( 'Issue new license' ) }
						</RouterLinkButton>
					}
				/>
			}
		>
			{ ! isLoading && <PerformanceTrackerStop /> }
			<DataViewsCard>
				<DataViews< JetpackLicense >
					data={ data?.items ?? [] }
					fields={ fields }
					view={ view }
					isLoading={ isLoading }
					isPlaceholderData={ isPlaceholderData }
					onChangeView={ handleViewChange }
					onReset={ resetView }
					getItemId={ getLicenseId }
					paginationInfo={ paginationInfo }
					defaultLayouts={ { table: {} } }
					config={ DEFAULT_CONFIG }
					empty={
						isFiltered ? (
							<DataViewsEmptyStateLayout
								isBorderless
								title={ __( 'No licenses match your search' ) }
								description={ __( 'Try a different search term or filter.' ) }
							/>
						) : (
							<DataViewsEmptyStateLayout
								isBorderless
								title={ __( 'No licenses yet' ) }
								description={ __( 'Licenses you purchase from the Marketplace will appear here.' ) }
							/>
						)
					}
				/>
			</DataViewsCard>
		</PageLayout>
	);
}
