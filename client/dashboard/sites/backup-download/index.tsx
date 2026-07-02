import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { siteBackupDownloadRoute } from '../../app/router/sites';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { BackupDownloadFlow } from './flow';

function SiteBackupDownload() {
	const { siteSlug, rewindId } = siteBackupDownloadRoute.useParams();
	const { downloadId: searchDownloadId } = siteBackupDownloadRoute.useSearch();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const router = useRouter();

	const handleDownloadIdConsumed = useCallback( () => {
		router.navigate( {
			to: siteBackupDownloadRoute.fullPath,
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
				initialDownloadId={ searchDownloadId }
				onDownloadIdConsumed={ handleDownloadIdConsumed }
			/>
		</PageLayout>
	);
}

export default SiteBackupDownload;
