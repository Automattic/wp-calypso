import { HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams, useRouter } from '@tanstack/react-router';
import { useMemo } from 'react';
import {
	siteRoute,
	siteBackupsRoute,
	siteBackupsIndexRoute,
	siteBackupDetailRoute,
	siteBackupRestoreRoute,
	siteBackupDownloadRoute,
} from '../../../../../app/router/sites';
import {
	BackupsPage,
	type BackupsNavigation,
} from '../../../../../sites/backups/components/backups-page';
import { SitesNoticeArbiter } from '../../../../../sites/components/notice-arbiter';
import { hasHostingFeature } from '../../../../../utils/site-features';

function BackupsListPage() {
	const { siteSlug } = siteRoute.useParams();
	const router = useRouter();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const searchParams = siteBackupsRoute.useSearch();

	const routeParams = useParams( { strict: false, shouldThrow: false } ) as
		{ rewindId?: string } | undefined;
	const rewindId = routeParams?.rewindId;

	const navigation = useMemo< BackupsNavigation >( () => {
		const listRoute = {
			to: siteBackupsIndexRoute.fullPath,
			params: { siteSlug },
		} as const;
		return {
			listPath: router.buildLocation( listRoute ).pathname,
			selectBackup: ( id ) =>
				id
					? router.navigate( {
							to: siteBackupDetailRoute.fullPath,
							params: { siteSlug, rewindId: id },
							search: ( query: Record< string, string > ) => query,
						} )
					: router.navigate( {
							...listRoute,
							search: ( query: Record< string, string > ) => query,
						} ),
			restoreLinkTo: siteBackupRestoreRoute.fullPath,
			requestRestore: ( id ) =>
				router.navigate( {
					to: siteBackupRestoreRoute.fullPath,
					params: { siteSlug, rewindId: id },
				} ),
			requestDownload: ( id, downloadId ) =>
				downloadId
					? router.navigate( {
							to: siteBackupDownloadRoute.fullPath,
							params: { siteSlug, rewindId: id },
							search: { downloadId },
						} )
					: router.navigate( {
							to: siteBackupDownloadRoute.fullPath,
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
			hasBackups={ hasHostingFeature( site, HostingFeatures.BACKUPS_SELF_SERVE ) }
			extraNotices={ <SitesNoticeArbiter /> }
		/>
	);
}

export default BackupsListPage;
