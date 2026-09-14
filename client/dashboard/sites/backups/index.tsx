import { HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet, useParams, useRouter } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { backup } from '@wordpress/icons';
import { useMemo } from 'react';
import {
	siteRoute,
	siteBackupsRoute,
	siteBackupsIndexRoute,
	siteBackupDetailRoute,
	siteBackupRestoreRoute,
	siteBackupDownloadRoute,
} from '../../app/router/sites';
import { hasHostingFeature } from '../../utils/site-features';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import { SitesNoticeArbiter } from '../notice-arbiter';
import { BackupFileBrowserProvider } from './backup-file-browser-provider';
import illustrationUrl from './backups-callout-illustration.svg';
import { BackupsPage, type BackupsNavigation } from './backups-page';
import './style.scss';

export function BackupsListPage() {
	const { siteSlug } = siteRoute.useParams();
	const router = useRouter();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const searchParams = siteBackupsRoute.useSearch();

	const routeParams = useParams( { strict: false, shouldThrow: false } ) as
		| { rewindId?: string }
		| undefined;
	const rewindId = routeParams?.rewindId;

	const navigation = useMemo< BackupsNavigation >(
		() => ( {
			selectBackup: ( id ) =>
				id
					? router.navigate( {
							to: siteBackupDetailRoute.fullPath,
							params: { siteSlug, rewindId: id },
							search: ( query: Record< string, string > ) => query,
					  } )
					: router.navigate( {
							to: siteBackupsIndexRoute.fullPath,
							params: { siteSlug },
							search: ( query: Record< string, string > ) => query,
					  } ),
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
		} ),
		[ router, siteSlug ]
	);

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

function SiteBackups() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	return (
		<HostingFeatureGatedWithCallout
			site={ site }
			feature={ HostingFeatures.BACKUPS_SELF_SERVE }
			fullPage
			upsellId="site-backups"
			upsellIcon={ backup }
			upsellTitle={ __( 'Secure your content with Jetpack Backups' ) }
			upsellImage={ illustrationUrl }
			upsellDescription={ __(
				'Protect your site with scheduled and real-time backups—giving you the ultimate “undo” button and peace of mind that your content is always safe.'
			) }
		>
			<BackupFileBrowserProvider>
				<Outlet />
			</BackupFileBrowserProvider>
		</HostingFeatureGatedWithCallout>
	);
}

export default SiteBackups;
