import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
import AdvancedCredentials from 'calypso/components/advanced-credentials';
import BackupRetentionManagement from 'calypso/components/backup-retention-management';
import DocumentHead from 'calypso/components/data/document-head';
import HasSitePurchasesSwitch from 'calypso/components/has-site-purchases-switch';
import BackupScheduleSetting from 'calypso/components/jetpack/backup-schedule-setting';
import IsCurrentUserAdminSwitch from 'calypso/components/jetpack/is-current-user-admin-switch';
import NotAuthorizedPage from 'calypso/components/jetpack/not-authorized-page';
import JetpackStagingSitesManagement from 'calypso/components/jetpack-staging-sites-management';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import { dashboardPath } from 'calypso/lib/jetpack/paths';
import { addQueryArgs } from 'calypso/lib/url';
import DisconnectSite from 'calypso/my-sites/site-settings/disconnect-site';
import ConfirmDisconnection from 'calypso/my-sites/site-settings/disconnect-site/confirm';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import NoSitesPurchasesMessage from './empty-content';
import HasRetentionCapabilitiesSwitch from './has-retention-capabilities-switch';
import HasSiteCredentialsSwitch from './has-site-credentials-switch';
import AdvancedCredentialsLoadingPlaceholder from './loading';
import SettingsPage from './main';
import type { Callback } from '@automattic/calypso-router';

const getAgencyDisconnectSiteContext = ( context: Parameters< Callback >[ 0 ] ) => {
	const { site_id, site_url } = context.query;
	const siteId = Number( site_id );
	const hasAgencySiteId = Number.isFinite( siteId );
	const siteSlug = typeof site_url === 'string' ? site_url : context.params.site;
	const siteUrl = /^https?:\/\//.test( siteSlug ) ? siteSlug : `https://${ siteSlug }`;

	return {
		hasAgencySiteId,
		siteId: hasAgencySiteId ? siteId : undefined,
		siteSlug,
		siteTitle: siteSlug,
		siteUrl,
	};
};

export const settings: Callback = ( context, next ) => {
	context.primary = <SettingsPage />;
	next();
};

export const advancedCredentials: Callback = ( context, next ) => {
	const { host, action } = context.query;
	const siteId = getSelectedSiteId( context.store.getState() ) as number;
	const sectionElt = <AdvancedCredentials action={ action } host={ host } role="main" />;

	// This parameter is useful to redirect back from checkout page and select the retention period
	// the customer previously selected.
	const retention = Number.isInteger( Number( context.query.retention ) )
		? Number( context.query.retention )
		: undefined;

	// It means that the customer has purchased storage
	const storagePurchased = Boolean( context.query.storage_purchased );

	context.primary = (
		<Main>
			<DocumentHead title={ translate( 'Settings' ) } />
			<SidebarNavigation />
			{ config.isEnabled( 'jetpack/backup-retention-settings' ) ? (
				<HasRetentionCapabilitiesSwitch
					siteId={ siteId }
					trueComponent={
						<BackupRetentionManagement
							defaultRetention={ retention }
							storagePurchased={ storagePurchased }
						/>
					}
					falseComponent={ null }
					loadingComponent={ <AdvancedCredentialsLoadingPlaceholder /> } // Let's use the same placeholder for now
				/>
			) : null }
			<HasSiteCredentialsSwitch
				siteId={ siteId }
				trueComponent={ sectionElt }
				falseComponent={
					<HasSitePurchasesSwitch
						siteId={ siteId }
						trueComponent={ sectionElt }
						falseComponent={ <NoSitesPurchasesMessage /> }
						loadingComponent={ <AdvancedCredentialsLoadingPlaceholder /> }
					/>
				}
				loadingComponent={ <AdvancedCredentialsLoadingPlaceholder /> }
			/>
			<HasSiteCredentialsSwitch
				siteId={ siteId }
				trueComponent={ <JetpackStagingSitesManagement /> }
				falseComponent={ null }
				loadingComponent={ <AdvancedCredentialsLoadingPlaceholder /> }
			/>
			{ config.isEnabled( 'jetpack/backup-schedule-setting' ) ? (
				<HasSitePurchasesSwitch
					siteId={ siteId }
					trueComponent={ <BackupScheduleSetting /> }
					falseComponent={ null }
					loadingComponent={ <AdvancedCredentialsLoadingPlaceholder /> }
				/>
			) : null }
		</Main>
	);

	next();
};

export const showNotAuthorizedForNonAdmins: Callback = ( context, next ) => {
	context.primary = (
		<IsCurrentUserAdminSwitch
			trueComponent={ context.primary }
			falseComponent={ <NotAuthorizedPage /> }
		/>
	);

	next();
};

export const disconnectSite: Callback = ( context, next ) => {
	const { hasAgencySiteId, siteId, siteSlug, siteTitle, siteUrl } =
		getAgencyDisconnectSiteContext( context );

	context.primary = (
		<DisconnectSite
			// Ignore type checking because TypeScript is incorrectly inferring the prop type due to the redirectNonJetpack HOC.
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-ignore
			reason={ context.params.reason }
			siteId={ siteId }
			siteSlug={ siteSlug }
			siteTitle={ siteTitle }
			siteUrl={ siteUrl }
			skipRedirectNonJetpack={ hasAgencySiteId }
			type={ context.query.type }
			backHref={ dashboardPath() }
		/>
	);
	next();
};

export const disconnectSiteConfirm: Callback = ( context, next ) => {
	const { reason, type, text } = context.query;
	const dashboardHref = dashboardPath();
	const { hasAgencySiteId, siteId, siteSlug } = getAgencyDisconnectSiteContext( context );
	const backHref = hasAgencySiteId
		? addQueryArgs(
				{
					site_id: siteId,
					site_url: siteSlug,
					type,
				},
				`/settings/disconnect-site/${ siteSlug }`
		  )
		: undefined;

	context.primary = (
		<ConfirmDisconnection
			// Ignore type checking because TypeScript is incorrectly inferring the prop type due to the redirectNonJetpack HOC.
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-ignore
			backHref={ backHref }
			reason={ reason }
			siteId={ siteId }
			siteSlug={ siteSlug }
			siteTitle={ siteSlug }
			skipRedirectNonJetpack={ hasAgencySiteId }
			type={ type }
			text={ text }
			disconnectHref={ dashboardHref }
			stayConnectedHref={ dashboardHref }
		/>
	);
	next();
};
