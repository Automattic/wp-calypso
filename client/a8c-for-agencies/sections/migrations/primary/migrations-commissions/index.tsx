import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
	LayoutHeaderActions as Actions,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_MIGRATIONS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import MigrationsCommissionsList from '../../commissions-list';
import MigrationsConsolidatedCommissions from '../../consolidated-commissions';
import useFetchTaggedSitesForMigration from '../../hooks/use-fetch-tagged-sites-for-migration';
import MigrationsTagSitesModal from '../../tag-sites-modal';
import MigrationsCommissionsEmptyState from './empty-state';

import './style.scss';

export default function MigrationsCommissions() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ showAddSitesModal, setShowAddSitesModal ] = useState( false );

	const title = translate( 'Migrations: Commissions' );

	const onTagSitesClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a8c_migrations_commissions_tag_sites_click' ) );
		setShowAddSitesModal( true );
	}, [ dispatch ] );

	const {
		data: taggedSites,
		isLoading,
		refetch: fetchMigratedSites,
	} = useFetchTaggedSitesForMigration();

	const showEmptyState = ! taggedSites?.length;

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
			<MigrationsCommissionsEmptyState setShowAddSitesModal={ setShowAddSitesModal } />
		) : (
			<div className="migrations-commissions__content">
				<MigrationsConsolidatedCommissions items={ taggedSites } />
				<MigrationsCommissionsList items={ taggedSites } />
			</div>
		);
	}, [ isLoading, showEmptyState, taggedSites, setShowAddSitesModal ] );

	return (
		<Layout
			className={ clsx( 'migrations-commissions', {
				'full-width-layout-with-table': ! showEmptyState,
			} ) }
			title={ title }
			wide
		>
			<LayoutTop>
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
						<Button variant="primary" onClick={ onTagSitesClick }>
							{ translate( 'Tag sites for commission' ) }
						</Button>
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
							fetchMigratedSites={ fetchMigratedSites }
						/>
					) }
				</>
			</LayoutBody>
		</Layout>
	);
}
