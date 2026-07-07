import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_MIGRATIONS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import MissingPaymentSettingsNotice from 'calypso/a8c-for-agencies/sections/referrals/common/missing-payment-settings-notice';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import MigrationsCommissionsList from '../../commissions-list';
import MigrationsConsolidatedCommissions from '../../consolidated-commissions';
import useCanTagSitesForCommission from '../../hooks/use-can-tag-sites-for-commission';
import useFetchTaggedSitesForMigration from '../../hooks/use-fetch-tagged-sites-for-migration';
import MigrationsTagSitesModal from '../../tag-sites-modal';
import MigrationsCommissionsEmptyState from './empty-state';
import IncentiveEndedBanner from './incentive-ended-banner';

import './style.scss';

export default function MigrationsCommissions() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ showAddSitesModal, setShowAddSitesModal ] = useState( false );
	const { canTagSitesForCommission, migrationTags } = useCanTagSitesForCommission();

	const title = translate( 'Migrations: commissions' );

	const onTagSitesClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a8c_migrations_commissions_tag_sites_click' ) );
		setShowAddSitesModal( true );
	}, [ dispatch ] );

	const { data, isLoading } = useFetchTaggedSitesForMigration();
	const taggedSites = data ?? [];

	const showEmptyState = ! taggedSites.length;

	const content = useMemo( () => {
		if ( isLoading ) {
			return (
				<>
					<TextPlaceholder />
					<TextPlaceholder />
				</>
			);
		}

		return showEmptyState ? (
			<MigrationsCommissionsEmptyState
				setShowAddSitesModal={ setShowAddSitesModal }
				canTagSitesForCommission={ canTagSitesForCommission }
			/>
		) : (
			<div className="migrations-commissions__content">
				{ canTagSitesForCommission && <MigrationsConsolidatedCommissions items={ taggedSites } /> }
				<MigrationsCommissionsList items={ taggedSites } migrationTags={ migrationTags } />
			</div>
		);
	}, [ isLoading, showEmptyState, canTagSitesForCommission, taggedSites, migrationTags ] );

	return (
		<Layout
			className={ clsx( 'migrations-commissions', {
				'full-width-layout-with-table': ! showEmptyState,
			} ) }
			title={ title }
			wide
		>
			<LayoutTop isFullWidth={ ! showEmptyState }>
				{ ! canTagSitesForCommission && <IncentiveEndedBanner /> }
				{ ! showEmptyState && <MissingPaymentSettingsNotice commissionType="migrations" /> }
				<LayoutHeader>
					<Breadcrumb
						hideOnMobile
						items={ [
							{
								label: translate( 'Migrations' ),
								href: A4A_MIGRATIONS_LINK,
							},
							{
								label: translate( 'Commissions' ),
							},
						] }
					/>
					<Actions useColumnAlignment>
						<MobileSidebarNavigation />
						{ canTagSitesForCommission && (
							<Button variant="primary" onClick={ onTagSitesClick }>
								{ translate( 'Tag sites for commission' ) }
							</Button>
						) }
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<>
					{ content }
					{ showAddSitesModal && (
						<MigrationsTagSitesModal
							onClose={ () => setShowAddSitesModal( false ) }
							taggedSites={ taggedSites }
							migrationTags={ migrationTags }
						/>
					) }
				</>
			</LayoutBody>
		</Layout>
	);
}
