import { useTranslate } from 'i18n-calypso';
import Cards from './cards';
import { Container, Header } from './layout';
import type { SiteDetails } from '@automattic/data-stores';

export const MigrationStartedDIY = ( { site }: { site: SiteDetails } ) => {
	const translate = useTranslate();
	const title = translate( 'Your migration is underway' );
	const migrationSourceSiteDomain = site?.options?.migration_source_site_domain
		? site?.options?.migration_source_site_domain?.replace( /^https?:\/\/|\/+$/g, '' )
		: translate( 'your site' );

	const subTitle = translate(
		'Sit back as {{strong}}%(siteName)s{{/strong}} transfers to its new home. Get ready for unmatched WordPress hosting.',
		{
			components: { strong: <strong /> },
			args: { siteName: migrationSourceSiteDomain },
		}
	) as string;

	return (
		<Container>
			<Header title={ title } subTitle={ subTitle } />
			<Cards />
		</Container>
	);
};
