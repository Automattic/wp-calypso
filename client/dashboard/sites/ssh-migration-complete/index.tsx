import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import PageLayout from '../../components/page-layout';
import { SSHMigrationCompleteContentInfo } from '../migration-overview/ssh-migration-complete-content-info';

export default function SSHMigrationComplete( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	return (
		<PageLayout>
			<SSHMigrationCompleteContentInfo site={ site } />
		</PageLayout>
	);
}
