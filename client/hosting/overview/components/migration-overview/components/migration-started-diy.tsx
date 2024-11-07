import { translate } from 'i18n-calypso';
import Cards from './cards';
import { Container, Header } from './layout';
import type { SiteDetails } from '@automattic/data-stores';

export const MigrationStartedDIY = ( { site }: { site: SiteDetails } ) => {
	const title = translate( 'Your migration is underway' );
	const subTitle = translate(
		'Sit back as {{strong}}%(siteName)s{{/strong}} transfers to its new home. Get ready for unmatched WordPress hosting.',
		{
			components: { strong: <strong /> },
			args: { siteName: site.name ?? translate( 'your site' ) },
		}
	) as string;

	return (
		<Container>
			<Header title={ title } subTitle={ subTitle } />
			<Cards />
		</Container>
	);
};
