import {
	activeAgencyQuery,
	paginatedJetpackAgencyLicensesQuery,
	wooCommerceLicenseSitesQuery,
} from '@automattic/api-queries';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { usePersistentView } from '../../../app/hooks/use-persistent-view';
import { useLocale } from '../../../app/locale';
import { PerformanceTrackerStop } from '../../../app/performance-tracking';
import { hasAnyCapability, marketplacePurchasesRoute } from '../../../app/router/agency';
import { DataViews, DataViewsCard, DataViewsEmptyStateLayout } from '../../../components/dataviews';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import RouterLinkButton from '../../../components/router-link-button';
import { DEFAULT_CONFIG } from '../../../sites/dataviews/views';
import { AgencyNotices } from '../../components/agency-notices';
import PaymentRiskNotice, { hasPaymentRiskNotice } from '../../components/payment-risk-notice';
import PressableUsageLimitNotice, {
	usePressableUsageLimit,
} from '../../components/pressable-usage-limit-notice';
import {
	MilestoneFeedbackModal,
	isWithinFeedbackWindow,
	useMilestoneFeedback,
} from '../../feedback';
import { OWNER_ROLE } from '../../team/constants';
import { useLicenseActions } from './actions';
import {
	DEFAULT_VIEW,
	getLicenseFields,
	getLicenseId,
	recordLicenseViewChanges,
	toFetchOptions,
	withLicenseColumnStyles,
} from './dataviews';
import { isWooCommerceSiteLicense, withWooCommerceSites } from './license-status';
import { useCheckoutReturn } from './use-checkout-return';
import { useProvisioningLicenses } from './use-provisioning-licenses';
import type { JetpackLicense } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

export default function MarketplacePurchases() {
	const locale = useLocale();
	const { recordTracksEvent } = useAnalytics();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;
	const canRevoke = hasAnyCapability( agency?.user?.capabilities ?? [], 'a4a_revoke_licenses' );
	const isAgencyOwner = agency?.user?.role === OWNER_ROLE;
	const pressableUsageLimit = usePressableUsageLimit( agency );
	const currentSearchParams = marketplacePurchasesRoute.useSearch();
	useCheckoutReturn();

	const { view, updateView, resetView } = usePersistentView( {
		slug: 'marketplace-purchases',
		defaultView: DEFAULT_VIEW,
		queryParams: currentSearchParams,
		queryParamFilterFields: [ { field: 'status', operator: 'is' } ],
	} );

	const tableView = useMemo( () => withLicenseColumnStyles( view ), [ view ] );

	const { data, isLoading, isPlaceholderData } = useQuery( {
		...paginatedJetpackAgencyLicensesQuery( agencyId, toFetchOptions( view ) ),
		enabled: agencyId > 0,
		placeholderData: keepPreviousData,
	} );
	// Fetched after the list renders, and only when a Woo license is on screen: it is slow,
	// and the list shouldn't wait for it.
	const hasWooCommerceSiteLicenses = !! data?.items.some( isWooCommerceSiteLicense );
	const { data: wooCommerceSites, isLoading: isLoadingWooCommerceSites } = useQuery( {
		...wooCommerceLicenseSitesQuery( agencyId ),
		enabled: agencyId > 0 && hasWooCommerceSiteLicenses,
	} );
	const licenses = useMemo(
		() => withWooCommerceSites( data?.items ?? [], wooCommerceSites, isLoadingWooCommerceSites ),
		[ data?.items, wooCommerceSites, isLoadingWooCommerceSites ]
	);
	const { provisioningLicenseKeys, isProvisioning } = useProvisioningLicenses( agencyId );
	const [ isFeedbackOpen, setIsFeedbackOpen ] = useState( false );
	const { shouldAsk } = useMilestoneFeedback( 'purchase-completed' );
	// Memoised: useLicenseActions keys its actions off this callback's identity.
	const onLicenseAssigned = useCallback( () => {
		if ( shouldAsk ) {
			setIsFeedbackOpen( true );
		}
	}, [ shouldAsk ] );
	const onManageSite = useCallback(
		( license: JetpackLicense ) => {
			if ( shouldAsk && isWithinFeedbackWindow( license.attached_at ) ) {
				setIsFeedbackOpen( true );
			}
		},
		[ shouldAsk ]
	);
	const fields = useMemo(
		() =>
			getLicenseFields( {
				locale,
				isAgencyOwner,
				provisioningLicenseKeys,
				isLoadingWooCommerceSites,
				onManageSite,
			} ),
		[ locale, isAgencyOwner, provisioningLicenseKeys, isLoadingWooCommerceSites, onManageSite ]
	);
	const actions = useLicenseActions( {
		agencyId,
		canRevoke,
		isAgencyOwner,
		isProvisioning,
		onLicenseAssigned,
	} );

	const onChangeView = ( nextView: View ) => {
		recordLicenseViewChanges( view, nextView, recordTracksEvent );
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
							to="/products"
							variant="primary"
							__next40pxDefaultSize
							onClick={ () => recordTracksEvent( 'calypso_a4a_license_list_issue_license_click' ) }
						>
							{ __( 'Issue new license' ) }
						</RouterLinkButton>
					}
				/>
			}
			notices={
				<AgencyNotices
					candidates={ [
						{
							id: 'payment-risk',
							isUrgent: true,
							isEligible: hasPaymentRiskNotice( agency ),
							notice: <PaymentRiskNotice agency={ agency } source="purchases_licenses" />,
						},
						{
							id: 'pressable-usage-limit',
							...pressableUsageLimit,
							notice: <PressableUsageLimitNotice agency={ agency } />,
						},
					] }
				/>
			}
		>
			{ ! isLoading && <PerformanceTrackerStop /> }
			<DataViewsCard>
				<DataViews< JetpackLicense >
					data={ licenses }
					fields={ fields }
					actions={ actions }
					view={ tableView }
					isLoading={ isLoading }
					isPlaceholderData={ isPlaceholderData }
					onChangeView={ onChangeView }
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
			{ isFeedbackOpen && (
				<MilestoneFeedbackModal
					type="purchase-completed"
					onClose={ () => setIsFeedbackOpen( false ) }
				/>
			) }
		</PageLayout>
	);
}
