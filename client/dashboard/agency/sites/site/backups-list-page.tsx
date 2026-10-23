import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams, useRouter } from '@tanstack/react-router';
import { useMemo } from 'react';
import {
	agencySiteRoute,
	agencySiteBackupsRoute,
	agencySiteBackupsIndexRoute,
	agencySiteBackupDetailRoute,
	agencySiteBackupRestoreRoute,
	agencySiteBackupDownloadRoute,
} from '../../../app/router/agency';
import { BackupsPage, type BackupsNavigation } from '../../../sites/backups/backups-page';

export default function AgencySiteBackupsListPage() {
	const { siteSlug } = agencySiteRoute.useParams();
	const router = useRouter();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const searchParams = agencySiteBackupsRoute.useSearch();

	const routeParams = useParams( { strict: false, shouldThrow: false } ) as
		{ rewindId?: string } | undefined;
	const rewindId = routeParams?.rewindId;

	const navigation = useMemo< BackupsNavigation >( () => {
		const listRoute = {
			to: agencySiteBackupsIndexRoute.fullPath,
			params: { siteSlug },
		} as const;
		return {
			listPath: router.buildLocation( listRoute ).pathname,
			selectBackup: ( id ) =>
				id
					? router.navigate( {
							to: agencySiteBackupDetailRoute.fullPath,
							params: { siteSlug, rewindId: id },
							search: ( query: Record< string, string > ) => query,
						} )
					: router.navigate( {
							...listRoute,
							search: ( query: Record< string, string > ) => query,
						} ),
			requestRestore: ( id ) =>
				router.navigate( {
					to: agencySiteBackupRestoreRoute.fullPath,
					params: { siteSlug, rewindId: id },
				} ),
			requestDownload: ( id, downloadId ) =>
				downloadId
					? router.navigate( {
							to: agencySiteBackupDownloadRoute.fullPath,
							params: { siteSlug, rewindId: id },
							search: { downloadId },
						} )
					: router.navigate( {
							to: agencySiteBackupDownloadRoute.fullPath,
							params: { siteSlug, rewindId: id },
						} ),
		};
	}, [ router, siteSlug ] );

	return (
		<BackupsPage
			site={ site }
			navigation={ navigation }
			rewindId={ rewindId }
			searchParams={ searchParams }
		/>
	);
}
