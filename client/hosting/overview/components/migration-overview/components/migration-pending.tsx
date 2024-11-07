import { translate } from 'i18n-calypso';
import { HostingHeroButton } from 'calypso/components/hosting-hero';
import { addQueryArgs } from 'calypso/lib/url';
import { getMigrationType } from 'calypso/sites-dashboard/utils';
import Cards from './cards';
import { Container, Header } from './layout';
import type { SiteDetails } from '@automattic/data-stores';

const getContinueMigrationUrl = ( site: SiteDetails ): string | null => {
	const migrationType = getMigrationType( site );

	const baseQueryArgs = {
		siteId: site.ID,
		siteSlug: site.slug,
		ref: 'hosting-migration-overview',
	};

	if ( migrationType === 'diy' ) {
		return addQueryArgs(
			baseQueryArgs,
			'/setup/hosted-site-migration/site-migration-instructions'
		);
	}

	return addQueryArgs( baseQueryArgs, '/setup/hosted-site-migration/site-migration-credentials' );
};

export const MigrationPending = ( { site }: { site: SiteDetails } ) => {
	const continueMigrationUrl = getContinueMigrationUrl( site );
	const title = translate( 'Your WordPress site is ready to be migrated' );
	const subTitle = translate(
		'Start your migration today and get ready for unmatched WordPress hosting.'
	);

	return (
		<Container>
			<Header title={ title } subTitle={ subTitle }>
				{ continueMigrationUrl && (
					<HostingHeroButton href={ continueMigrationUrl }>
						{ translate( 'Start your migration' ) }
					</HostingHeroButton>
				) }
			</Header>
			<Cards />
		</Container>
	);
};
