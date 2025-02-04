import { isJetpackBackupSlug } from '@automattic/calypso-products';
import Debug from 'debug';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import HasVaultPressSwitch from 'calypso/components/jetpack/has-vaultpress-switch';
import IsCurrentUserAdminSwitch from 'calypso/components/jetpack/is-current-user-admin-switch';
import IsJetpackDisconnectedSwitch from 'calypso/components/jetpack/is-jetpack-disconnected-switch';
import NotAuthorizedPage from 'calypso/components/jetpack/not-authorized-page';
import { UpsellProductCardPlaceholder } from 'calypso/components/jetpack/upsell-product-card';
import UpsellSwitch from 'calypso/components/jetpack/upsell-switch';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import { SiteOffsetProvider } from 'calypso/components/site-offset/context';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import BackupContentsPage from 'calypso/my-sites/backup/backup-contents-page';
import BackupUpsell from 'calypso/my-sites/backup/backup-upsell';
import BackupCloneFlow from 'calypso/my-sites/backup/clone-flow';
import BackupsPage from 'calypso/my-sites/backup/main';
import MultisiteNoBackupPlanSwitch from 'calypso/my-sites/backup/multisite-no-backup-plan-switch';
import BackupRewindFlow, { RewindFlowPurpose } from 'calypso/my-sites/backup/rewind-flow';
import WPCOMBackupUpsell from 'calypso/my-sites/backup/wpcom-backup-upsell';
import WpcomBackupUpsellPlaceholder from 'calypso/my-sites/backup/wpcom-backup-upsell-placeholder';
import { setFilter } from 'calypso/state/activity-log/actions';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

const debug = new Debug( 'calypso:my-sites:backup:controller' );

export function showUpsellIfNoBackup( context, next ) {
	debug( 'controller: showUpsellIfNoBackup', context.params );

	const UpsellComponent = isJetpackCloud() || isA8CForAgencies() ? BackupUpsell : WPCOMBackupUpsell;
	const UpsellPlaceholder =
		isJetpackCloud() || isA8CForAgencies()
			? UpsellProductCardPlaceholder
			: WpcomBackupUpsellPlaceholder;
	context.featurePreview = (
		<>
			<UpsellSwitch
				UpsellComponent={ UpsellComponent }
				QueryComponent={ QueryRewindState }
				getStateForSite={ getRewindState }
				isRequestingForSite={ ( state, siteId ) =>
					'uninitialized' === getRewindState( state, siteId )?.state
				}
				display={ context.featurePreview }
				productSlugTest={ isJetpackBackupSlug }
			>
				{ isJetpackCloud() && <SidebarNavigation /> }
				<UpsellPlaceholder />
			</UpsellSwitch>
		</>
	);
	next();
}

export function showJetpackIsDisconnected( context, next ) {
	debug( 'controller: showJetpackIsDisconnected', context.params );

	const JetpackConnectionFailed =
		isJetpackCloud() || isA8CForAgencies() ? (
			<BackupUpsell reason="no_connected_jetpack" />
		) : (
			<WPCOMBackupUpsell reason="no_connected_jetpack" />
		);
	context.featurePreview = (
		<IsJetpackDisconnectedSwitch
			trueComponent={ JetpackConnectionFailed }
			falseComponent={ context.featurePreview }
		/>
	);
	next();
}

export function showNotAuthorizedForNonAdmins( context, next ) {
	context.featurePreview = (
		<IsCurrentUserAdminSwitch
			trueComponent={ context.featurePreview }
			falseComponent={ <NotAuthorizedPage /> }
		/>
	);

	next();
}

export function showUnavailableForVaultPressSites( context, next ) {
	debug( 'controller: showUnavailableForVaultPressSites', context.params );

	const message =
		isJetpackCloud() || isA8CForAgencies() ? (
			<BackupUpsell reason="vp_active_on_site" />
		) : (
			<WPCOMBackupUpsell reason="vp_active_on_site" />
		);

	context.featurePreview = (
		<HasVaultPressSwitch trueComponent={ message } falseComponent={ context.featurePreview } />
	);

	next();
}

export function showUnavailableForMultisites( context, next ) {
	debug( 'controller: showUnavailableForMultisites', context.params );

	// Only show "Multisite not supported" card if the multisite does not already own a Backup subscription.
	// https://href.li/?https://wp.me/pbuNQi-1jg
	const message =
		isJetpackCloud() || isA8CForAgencies() ? (
			<BackupUpsell reason="multisite_not_supported" />
		) : (
			<WPCOMBackupUpsell reason="multisite_not_supported" />
		);

	context.featurePreview = (
		<MultisiteNoBackupPlanSwitch
			trueComponent={ message }
			falseComponent={ context.featurePreview }
		/>
	);

	next();
}

/* handles /backup/:site, see `backupMainPath` */
export function backups( context, next ) {
	debug( 'controller: backups', context.params );

	// When a user visits `/backup`, we don't want to carry over any filter
	// selection that could've happened in the Activity Log, otherwise,
	// the app will render the `SearchResults` component instead of the
	// `BackupStatus`.
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	context.store.dispatch( setFilter( siteId, {}, true ) );

	const { date } = context.query;

	context.featurePreview = <BackupsPage queryDate={ date } />;
	next();
}

/* handles /backup/:site/download/:rewindId, see `backupDownloadPath` */
export function backupDownload( context, next ) {
	debug( 'controller: backupDownload', context.params );

	context.featurePreview = (
		<BackupRewindFlow rewindId={ context.params.rewindId } purpose={ RewindFlowPurpose.DOWNLOAD } />
	);
	next();
}

/* handles /backup/:site/restore/:rewindId, see `backupRestorePath` */
export function backupRestore( context, next ) {
	debug( 'controller: backupRestore', context.params );

	context.featurePreview = (
		<BackupRewindFlow rewindId={ context.params.rewindId } purpose={ RewindFlowPurpose.RESTORE } />
	);
	next();
}

/* handles /backup/:site/granular-restore/:rewindId, see `backupGranularRestorePath` */
export function backupGranularRestore( context, next ) {
	debug( 'controller: backupGranularRestore', context.params );

	context.featurePreview = (
		<>
			<BackupRewindFlow
				rewindId={ context.params.rewindId }
				purpose={ RewindFlowPurpose.GRANULAR_RESTORE }
			/>
		</>
	);
	next();
}

/* handles /backup/:site/clone, see `backupClonePath` */
export function backupClone( context, next ) {
	debug( 'controller: backupClone', context.params );
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );

	context.featurePreview = <BackupCloneFlow siteId={ siteId } />;
	next();
}

/* handles /backup/:site/contents/:backupDate, see `backupContentsPath` */
export function backupContents( context, next ) {
	debug( 'controller: backupContents', context.params );
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );

	context.featurePreview = (
		<BackupContentsPage siteId={ siteId } rewindId={ context.params.rewindId } />
	);
	next();
}

export function wrapInSiteOffsetProvider( context, next ) {
	context.featurePreview = (
		<SiteOffsetProvider site={ context.params.site }>{ context.featurePreview }</SiteOffsetProvider>
	);
	next();
}
