import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useCallback } from 'react';
import { agencySiteBackupDownloadRoute } from '../../../app/router/agency';
import { BackupDownloadPage } from '../../../sites/backup-download/download-page';

export default function AgencySiteBackupDownload() {
	const { siteSlug, rewindId } = agencySiteBackupDownloadRoute.useParams();
	const { downloadId } = agencySiteBackupDownloadRoute.useSearch();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const router = useRouter();

	const onConsumeDownloadId = useCallback( () => {
		router.navigate( {
			to: agencySiteBackupDownloadRoute.fullPath,
			params: { siteSlug, rewindId },
			search: {},
			replace: true,
		} );
	}, [ router, siteSlug, rewindId ] );

	return (
		<BackupDownloadPage
			site={ site }
			rewindId={ rewindId }
			downloadId={ downloadId }
			onConsumeDownloadId={ onConsumeDownloadId }
		/>
	);
}
