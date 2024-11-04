import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT } from 'calypso/a8c-for-agencies/components/a4a-contact-support-widget';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import MigrationsBanner from './sections/migrations-banner';
import MigrationsClientRelationship from './sections/migrations-client-relationship';
import MigrationsCTA from './sections/migrations-cta';
import MigrationsFAQs from './sections/migrations-faqs';
import MigrationsHostingFeatures from './sections/migrations-hosting-features';
import MigrationsHostingOptions from './sections/migrations-hosting-options';
import MigrationsProcess from './sections/migrations-process';
import MigrationsTestimonials from './sections/migrations-testimonials';

import './style.scss';

export default function MigrationsOverviewV2() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const title = translate( 'Migrations' );

	const onMigrateSitesClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_migrations_migrate_sites_button_click' ) );
	}, [ dispatch ] );

	return (
		<Layout className="migrations-overview-v2" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<MobileSidebarNavigation />

						<Button
							variant="primary"
							onClick={ onMigrateSitesClick }
							href={ CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT }
						>
							{ translate( 'Migrate your sites' ) }
						</Button>
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<div className="migrations-overview-v2__content-wrapper">
					<MigrationsBanner />
					<MigrationsHostingFeatures />
					<MigrationsTestimonials />
					<MigrationsHostingOptions />
					<MigrationsProcess />
					<MigrationsClientRelationship />
					<MigrationsCTA />
					<MigrationsFAQs />
				</div>
			</LayoutBody>
		</Layout>
	);
}
