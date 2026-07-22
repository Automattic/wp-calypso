import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_MIGRATIONS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import MissingPaymentSettingsNotice from 'calypso/a8c-for-agencies/sections/referrals/common/missing-payment-settings-notice';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import getSites from 'calypso/state/selectors/get-sites';
import MigrationsCommissionsContent from '../../commissions-content';
import useCanTagSitesForCommission from '../../hooks/use-can-tag-sites-for-commission';
import useFetchTaggedSitesForMigration from '../../hooks/use-fetch-tagged-sites-for-migration';
import type { ReactNode } from 'react';

import './style.scss';

export default function MigrationsCommissions() {
	const dispatch = useDispatch();
	const sites = useSelector( getSites );

	const [ showAddSitesModal, setShowAddSitesModal ] = useState( false );
	const {
		canTagSitesForCommission,
		migrationTags,
		isLoading: isTagEligibilityLoading,
	} = useCanTagSitesForCommission();

	const title = __( 'Migrations: commissions' );

	const recordTracks = useCallback(
		( name: string, properties?: Record< string, unknown > ) =>
			dispatch( recordTracksEvent( name, properties ) ),
		[ dispatch ]
	);

	const onSuccess = useCallback(
		( message: ReactNode, options?: { id?: string; duration?: number } ) =>
			dispatch( successNotice( message, options ) ),
		[ dispatch ]
	);

	const onError = useCallback(
		( message: ReactNode ) => dispatch( errorNotice( message ) ),
		[ dispatch ]
	);

	const getSiteCreatedAt = useCallback(
		( blogId: number ) => sites.find( ( s ) => s?.ID === blogId )?.options?.created_at,
		[ sites ]
	);

	const onTagSitesClick = useCallback( () => {
		recordTracks( 'calypso_a8c_migrations_commissions_tag_sites_click' );
		setShowAddSitesModal( true );
	}, [ recordTracks ] );

	const { data, isLoading } = useFetchTaggedSitesForMigration();
	const taggedSites = data ?? [];
	const showEmptyState = taggedSites.length === 0;

	return (
		<Layout
			className={ clsx( 'migrations-commissions', {
				'full-width-layout-with-table': ! showEmptyState,
			} ) }
			title={ title }
			wide
		>
			<LayoutTop isFullWidth={ ! showEmptyState }>
				{ ! showEmptyState && <MissingPaymentSettingsNotice commissionType="migrations" /> }
				<LayoutHeader>
					<Breadcrumb
						hideOnMobile
						items={ [
							{
								label: __( 'Migrations' ),
								href: A4A_MIGRATIONS_LINK,
							},
							{
								label: __( 'Commissions' ),
							},
						] }
					/>
					<Actions useColumnAlignment>
						<MobileSidebarNavigation />
						{ ! isTagEligibilityLoading && canTagSitesForCommission && (
							<Button variant="primary" onClick={ onTagSitesClick }>
								{ __( 'Tag sites for commission' ) }
							</Button>
						) }
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<MigrationsCommissionsContent
					taggedSites={ taggedSites }
					isLoading={ isLoading }
					recordTracksEvent={ recordTracks }
					onSuccess={ onSuccess }
					onError={ onError }
					getSiteCreatedAt={ getSiteCreatedAt }
					canTagSitesForCommission={ canTagSitesForCommission }
					migrationTags={ migrationTags }
					isAddSitesModalOpen={ showAddSitesModal }
					onCloseAddSitesModal={ () => setShowAddSitesModal( false ) }
					onOpenAddSitesModal={ () => setShowAddSitesModal( true ) }
				/>
			</LayoutBody>
		</Layout>
	);
}
