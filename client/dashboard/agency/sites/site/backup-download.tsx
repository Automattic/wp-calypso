import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import Breadcrumbs from '../../../app/breadcrumbs';
import { agencySiteBackupDownloadRoute } from '../../../app/router/agency';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { BackupDownloadFlow } from '../../../sites/backup-download/flow';

export default function AgencySiteBackupDownload() {
	const { siteSlug, rewindId } = agencySiteBackupDownloadRoute.useParams();
	const { downloadId } = agencySiteBackupDownloadRoute.useSearch();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const router = useRouter();

	const handleDownloadIdConsumed = useCallback( () => {
		router.navigate( {
			to: agencySiteBackupDownloadRoute.fullPath,
			params: { siteSlug, rewindId },
			search: {},
			replace: true,
		} );
	}, [ router, siteSlug, rewindId ] );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader prefix={ <Breadcrumbs length={ 2 } /> } title={ __( 'Download backup' ) } />
			}
		>
			<BackupDownloadFlow
				site={ site }
				rewindId={ rewindId }
				initialDownloadId={ downloadId }
				onDownloadIdConsumed={ handleDownloadIdConsumed }
			/>
		</PageLayout>
	);
}
