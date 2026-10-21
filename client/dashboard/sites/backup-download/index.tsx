import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useCallback } from 'react';
import { siteBackupDownloadRoute } from '../../app/router/sites';
import { BackupDownloadPage } from './download-page';

function SiteBackupDownload() {
	const { siteSlug, rewindId } = siteBackupDownloadRoute.useParams();
	const { downloadId } = siteBackupDownloadRoute.useSearch();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const router = useRouter();

	const onConsumeDownloadId = useCallback( () => {
		router.navigate( {
			to: siteBackupDownloadRoute.fullPath,
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

export default SiteBackupDownload;
