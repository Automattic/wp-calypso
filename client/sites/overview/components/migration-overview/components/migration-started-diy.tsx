import { translate } from 'i18n-calypso';
import Cards from './cards';
import { Container, Header } from './layout';
import type { SiteDetails } from '@automattic/data-stores';

export const MigrationStartedDIY = ( { site }: { site: SiteDetails } ) => {
	const title = translate( 'Your migration is underway' );
	const migrationSourceSiteDomain = site?.options?.migration_source_site_domain?.replace(
		/^https?:\/\/|\/+$/g,
		''
	);

	const subTitle = translate(
		'Sit back as {{strong}}%(siteUrl)s{{/strong}} transfers to its new home. Get ready for unmatched WordPress hosting.',
		{
			components: { strong: <strong /> },
			args: { siteUrl: migrationSourceSiteDomain ?? translate( 'your site' ) },
		}
	) as string;

	return (
		<Container>
			<Header title={ title } subTitle={ subTitle } />
			<Cards />
		</Container>
	);
};
