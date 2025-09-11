import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import PageLayout from '../../components/page-layout';
import { getSiteMigrationState } from '../../utils/site-status';

export default function SiteMigrationInProgress( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const migrationState = getSiteMigrationState( site );

	return (
		<PageLayout size="small">
			<h1>{ migrationState?.status }</h1>
		</PageLayout>
	);
}
