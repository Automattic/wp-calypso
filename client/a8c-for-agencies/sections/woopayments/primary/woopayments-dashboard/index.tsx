import page from '@automattic/calypso-router';
import { __ } from '@wordpress/i18n';
import { addQueryArgs, getQueryArg, removeQueryArgs } from '@wordpress/url';
import clsx from 'clsx';
import { useCallback, useMemo, useReducer } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import { PageBodyPlaceholder } from 'calypso/a8c-for-agencies/components/page-placeholder';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_WOOPAYMENTS_SITE_SETUP_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import MissingPaymentSettingsNotice from 'calypso/a8c-for-agencies/sections/referrals/common/missing-payment-settings-notice';
import AddWooPaymentsToSite from 'calypso/dashboard/agency/earn/woopayments/add-woopayments-to-site';
import useWooPaymentsDashboardData from 'calypso/dashboard/agency/earn/woopayments/use-woopayments-dashboard-data';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import WooPaymentsDashboardContent from '../../dashboard-content';
import WooPaymentsDashboardEmptyState from './empty-state';

import './style.scss';

// The overview links here with this param to open the site picker.
const ADD_TO_SITE_PARAM = 'add-woopayments-to-site';

const WooPaymentsDashboard = () => {
	const title = __( 'WooPayments commissions' );

	const dispatch = useDispatch();
	const agencyId = useSelector( getActiveAgencyId ) ?? 0;

	const {
		isLoading,
		showEmptyState,
		hasSites,
		woopaymentsData,
		isLoadingWooPaymentsData,
		sitesWithPluginsStates,
	} = useWooPaymentsDashboardData( agencyId );

	const recordTracks = useCallback(
		( eventName: string, properties?: Record< string, unknown > ) => {
			dispatch( recordTracksEvent( eventName, properties ) );
		},
		[ dispatch ]
	);

	// Read on every render: a page.js navigation to this page with the param keeps this instance.
	const isAddSiteRequested = getQueryArg( window.location.href, ADD_TO_SITE_PARAM ) === 'true';
	// `replaceState` doesn't render, and the button takes another request only once it sees false.
	const [ , rerender ] = useReducer( ( count: number ) => count + 1, 0 );
	const removeAddSiteParam = useCallback( () => {
		window.history.replaceState(
			null,
			'',
			removeQueryArgs( window.location.pathname + window.location.search, ADD_TO_SITE_PARAM )
		);
		rerender();
	}, [] );

	const navigateToSiteSetup = useCallback( ( siteId: number ) => {
		page.redirect( addQueryArgs( A4A_WOOPAYMENTS_SITE_SETUP_LINK, { site_id: siteId } ) );
	}, [] );

	const excludedSiteIds = useMemo(
		() => sitesWithPluginsStates.map( ( site ) => site.blogId ),
		[ sitesWithPluginsStates ]
	);

	const content = useMemo( () => {
		if ( isLoading ) {
			return <PageBodyPlaceholder />;
		}

		if ( showEmptyState ) {
			return <WooPaymentsDashboardEmptyState />;
		}

		return (
			<WooPaymentsDashboardContent
				agencyId={ agencyId }
				woopaymentsData={ woopaymentsData }
				isLoadingWooPaymentsData={ isLoadingWooPaymentsData }
				sitesWithPluginsStates={ sitesWithPluginsStates }
			/>
		);
	}, [
		isLoading,
		showEmptyState,
		agencyId,
		woopaymentsData,
		isLoadingWooPaymentsData,
		sitesWithPluginsStates,
	] );

	const isFullWidth = ! showEmptyState && ! isLoading;

	return (
		<Layout
			className={ clsx( 'woopayments-dashboard', {
				'is-empty': showEmptyState,
				'full-width-layout-with-table': isFullWidth,
			} ) }
			title={ title }
			wide
		>
			<LayoutTop isFullWidth={ isFullWidth }>
				{ hasSites && <MissingPaymentSettingsNotice commissionType="woopayments" /> }
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<MobileSidebarNavigation />
						<div className="woopayments-dashboard__actions">
							{ ! isLoading && (
								<AddWooPaymentsToSite
									agencyId={ agencyId }
									excludedSiteIds={ excludedSiteIds }
									recordTracksEvent={ recordTracks }
									onSelectSite={ navigateToSiteSetup }
									autoOpen={ isAddSiteRequested }
									onAutoOpen={ removeAddSiteParam }
								/>
							) }
						</div>
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>{ content }</LayoutBody>
		</Layout>
	);
};

export default WooPaymentsDashboard;
