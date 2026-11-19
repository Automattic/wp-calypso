import { isAutomatticianQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getISOWeek, getISOWeekYear } from 'date-fns';
import { useState } from 'react';
import { Experiment } from 'calypso/lib/explat';
import AccountEmailBouncingNotice, {
	useShouldShowAccountEmailBouncingNotice,
} from '../../../app/account-email-bouncing-notice';
import { useAnalytics } from '../../../app/analytics';
import { useAuth } from '../../../app/auth';
import { useAppContext } from '../../../app/context';
import { usePersistentView } from '../../../app/hooks/use-persistent-view';
import RecoveryEmailMatchesAccountEmailNotice, {
	useShouldShowRecoveryEmailMatchesAccountEmailNotice,
} from '../../../app/recovery-email-matches-account-email-notice';
import SecurityKeyReregisterNotice, {
	useShouldShowSecurityKeyReregisterNotice,
} from '../../../app/security-key-reregister-notice';
import { DataViewsEmptyStateLayout } from '../../../components/dataviews';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import AddNewSite from '../../../sites/add-new-site';
import {
	SitesDataViews,
	useActions,
	useFields,
	getDefaultView,
	recordViewChanges,
	sanitizeFields,
} from '../../../sites/dataviews';
import { useHasOnlyDeletedSites } from '../../../sites/deleted-sites';
import {
	EmptyDeletedSitesStateContent,
	EmptySitesStateContent,
	EmptySitesSearchStateContent,
} from '../../../sites/empty-sites-state';
import { useSiteListQuery } from '../../../sites/hooks/use-site-list-query';
import { InviteAcceptedFlashMessage } from '../../../sites/invite-accepted-flash-message';
import { SitesNoticeArbiter } from '../../../sites/notice-arbiter';
import type { Site } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

export type SitesSearch = Record< string, unknown >;

function filterSortAndPaginateSites( sites: Site[], view: View, totalItems: number ) {
	return {
		data: sites,
		paginationInfo: {
			totalItems,
			totalPages: view.perPage ? Math.ceil( totalItems / view.perPage ) : 1,
		},
	};
}

export default function Sites( { search }: { search: SitesSearch } ) {
	const { recordTracksEvent } = useAnalytics();
	const isRestoringAccount = !! search.restored;

	const { user } = useAuth();
	const { supports } = useAppContext();
	const { data: isAutomattician } = useSuspenseQuery( isAutomatticianQuery() );

	const isSecurityKeyReregisterRequired = useShouldShowSecurityKeyReregisterNotice();
	const showSecurityKeyReregisterNotice = supports.me && isSecurityKeyReregisterRequired;
	const hasOnlyDeletedSites = useHasOnlyDeletedSites();

	const isAccountEmailBouncing = useShouldShowAccountEmailBouncingNotice();
	const showAccountEmailBouncingNotice = supports.me && isAccountEmailBouncing;

	const isRecoveryEmailMatchingAccountEmail = useShouldShowRecoveryEmailMatchesAccountEmailNotice();
	const showRecoveryEmailMatchesAccountEmailNotice =
		supports.me && isRecoveryEmailMatchingAccountEmail;

	const defaultView = getDefaultView( {
		siteCount: user.site_count,
		isAutomattician,
		isRestoringAccount,
	} );

	const { view, updateView, resetView } = usePersistentView( {
		slug: 'sites',
		defaultView,
		queryParams: search,
		queryParamFilterFields: [ 'is_deleted' ],
		sanitizeFields,
	} );

	const { sites, isLoadingSites, totalItems } = useSiteListQuery( view, {
		isDefaultView: ! resetView && ! view.search && view.page === 1,
		isRestoringAccount,
		isAutomattician,
	} );

	const fields = useFields( { isAutomattician, viewType: view.type } );
	const actions = useActions();

	const [ isModalOpen, setIsModalOpen ] = useState( false );

	const handleViewChange = ( nextView: View ) => {
		recordViewChanges( view, nextView, recordTracksEvent );
		updateView( nextView );
	};

	const userHasSites = user.site_count > 0;

	const { data: filteredData, paginationInfo } = filterSortAndPaginateSites(
		sites ?? [],
		view,
		totalItems ?? 0
	);

	let emptySitesState = null;
	if ( hasOnlyDeletedSites === true ) {
		emptySitesState = (
			<DataViewsEmptyStateLayout
				title={ __( 'You don’t have any active sites' ) }
				description={ __( 'Restore a deleted site, or start a new one.' ) }
			>
				<EmptyDeletedSitesStateContent />
			</DataViewsEmptyStateLayout>
		);
	} else if ( hasOnlyDeletedSites === false ) {
		emptySitesState = (
			<DataViewsEmptyStateLayout
				title={ __( 'You don’t have any sites yet' ) }
				description={ __(
					'Start a site and begin creating, coding, or exploring what WordPress can do.'
				) }
			>
				<EmptySitesStateContent />
			</DataViewsEmptyStateLayout>
		);
	}

	const filters = view.filters ?? [];
	const hasActiveSearch = !! view.search;
	const hasActiveQuery = hasActiveSearch || filters.length > 0;

	return (
		<>
			<InviteAcceptedFlashMessage />
			{ isModalOpen && (
				<Modal title={ __( 'Add new site' ) } onRequestClose={ () => setIsModalOpen( false ) }>
					<AddNewSite context="sites-dashboard" />
				</Modal>
			) }
			<PageLayout
				header={
					<PageHeader
						title={ __( 'Sites' ) }
						actions={
							userHasSites && (
								<Button
									variant="primary"
									onClick={ () => {
										recordTracksEvent( 'calypso_dashboard_sites_add_new_site_clicked' );
										setIsModalOpen( true );
									} }
									__next40pxDefaultSize
								>
									{ __( 'Add new site' ) }
								</Button>
							)
						}
					/>
				}
				notices={
					<SitesNoticeArbiter>
						{ showSecurityKeyReregisterNotice && <SecurityKeyReregisterNotice /> }
						{ showAccountEmailBouncingNotice && <AccountEmailBouncingNotice /> }
						{ showRecoveryEmailMatchesAccountEmailNotice && (
							<RecoveryEmailMatchesAccountEmailNotice />
						) }
					</SitesNoticeArbiter>
				}
			>
				{ userHasSites || hasActiveQuery ? (
					<SitesDataViews
						view={ view }
						sites={ filteredData }
						fields={ fields }
						actions={ actions }
						isLoading={ isLoadingSites }
						empty={
							<DataViewsEmptyStateLayout
								title={ __( 'No sites match your search' ) }
								description={ __( 'Try again, or start a new site with the options below.' ) }
								isBorderless
							>
								<EmptySitesSearchStateContent />
							</DataViewsEmptyStateLayout>
						}
						paginationInfo={ paginationInfo }
						onChangeView={ handleViewChange }
						onReset={ resetView }
					/>
				) : (
					emptySitesState
				) }
			</PageLayout>
			{ /* ExPlat's Evergreen A/A Test Experiment:
			 *
			 * This continually starts a new experiment every week that doesn't render anything and
			 * shouldn't send any extra requests, just to help us ensure our experimentation system is
			 * working smoothly.
			 *
			 * This particular spot isn't special, it just needs somewhere to live.
			 *
			 * We use iso-week and iso-week-year in order to consistently change the experiment name every week.
			 * Assumes users have a somewhat working clock but shouldn't be a problem if they don't.
			 */ }
			<Experiment
				name={ ( () => {
					const now = new Date();
					const year = getISOWeekYear( now );
					const week = String( getISOWeek( now ) ).padStart( 2, '0' );
					return `explat_test_aa_weekly_calypso_${ year }_week_${ week }`;
				} )() }
				defaultExperience={ null }
				treatmentExperience={ null }
				loadingExperience={ null }
			/>
		</>
	);
}
