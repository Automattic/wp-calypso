import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../../app/breadcrumbs';
import { agencySiteBackupRestoreRoute } from '../../../app/router/agency';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { BackupRestoreFlow } from '../../../sites/backup-restore/flow';

export default function AgencySiteBackupRestore() {
	const { siteSlug, rewindId } = agencySiteBackupRestoreRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader prefix={ <Breadcrumbs length={ 2 } /> } title={ __( 'Site restore' ) } />
			}
		>
			<BackupRestoreFlow site={ site } rewindId={ rewindId } />
		</PageLayout>
	);
}
