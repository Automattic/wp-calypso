import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { BackupDownloadFlow } from './flow';
import type { Site } from '@automattic/api-core';

interface BackupDownloadPageProps {
	site: Site;
	rewindId: string;
	downloadId?: number;
	// Clears the downloadId once it has seeded the flow; each variant navigates its own route.
	onConsumeDownloadId: () => void;
}

export function BackupDownloadPage( {
	site,
	rewindId,
	downloadId,
	onConsumeDownloadId,
}: BackupDownloadPageProps ) {
	useEffect( () => {
		if ( downloadId ) {
			onConsumeDownloadId();
		}
	}, [ downloadId, onConsumeDownloadId ] );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader prefix={ <Breadcrumbs length={ 2 } /> } title={ __( 'Download backup' ) } />
			}
		>
			<BackupDownloadFlow site={ site } rewindId={ rewindId } initialDownloadId={ downloadId } />
		</PageLayout>
	);
}
