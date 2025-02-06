import { useTranslate } from 'i18n-calypso';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import MigrateSiteButton from './migrate-site-button';
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

	const title = translate( 'Migrations' );

	return (
		<Layout className="migrations-overview-v2" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<MobileSidebarNavigation />
						<MigrateSiteButton />
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
