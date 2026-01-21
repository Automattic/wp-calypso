import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_MIGRATIONS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import MigrationsCommissionsList from '../../commissions-list';
import MigrationsConsolidatedCommissions from '../../consolidated-commissions';
import useFetchTaggedSitesForMigration from '../../hooks/use-fetch-tagged-sites-for-migration';
import MigrationsCommissionsEmptyState from './empty-state';

import './style.scss';

export default function MigrationsCommissions() {
	const translate = useTranslate();

	const title = translate( 'Migrations: Commissions' );

	const { data: taggedSites, isLoading } = useFetchTaggedSitesForMigration();

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
			<MigrationsCommissionsEmptyState />
		) : (
			<div className="migrations-commissions__content">
				<MigrationsConsolidatedCommissions items={ taggedSites } />
				<MigrationsCommissionsList items={ taggedSites } />
			</div>
		);
	}, [ isLoading, showEmptyState, taggedSites ] );

	return (
		<Layout
			className={ clsx( 'migrations-commissions', {
				'full-width-layout-with-table': ! showEmptyState,
			} ) }
			title={ title }
			wide
		>
			<LayoutTop isFullWidth={ ! showEmptyState }>
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
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>{ content }</LayoutBody>
		</Layout>
	);
}
