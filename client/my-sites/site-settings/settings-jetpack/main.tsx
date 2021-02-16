/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'calypso/components/data/document-head';
import JetpackAdvancedCredentials from 'calypso/jetpack-cloud/sections/settings/advanced-credentials';
import JetpackCredentials from 'calypso/my-sites/site-settings/jetpack-credentials';
import JetpackDevModeNotice from 'calypso/my-sites/site-settings/jetpack-dev-mode-notice';
import JetpackManageErrorPage from 'calypso/my-sites/jetpack-manage-error-page';
import Main from 'calypso/components/main';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import FormattedHeader from 'calypso/components/formatted-header';
import SiteSettingsNavigation from 'calypso/my-sites/site-settings/navigation';
import { siteHasScanProductPurchase } from 'calypso/state/purchases/selectors';
import isRewindActive from 'calypso/state/selectors/is-rewind-active';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import isSiteFailedMigrationSource from 'calypso/state/selectors/is-site-failed-migration-source';
import { isEnabled } from '@automattic/calypso-config';

type Props = {
	action?: string;
	host?: string;
};

const SiteSettingsJetpack: React.FC< Props > = ( { action, host } ) => {
	const site = useSelector( getSelectedSite );
	const siteId = useSelector( getSelectedSiteId );
	const siteIsJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const showCredentials = useSelector(
		( state ) =>
			siteId &&
			( isSiteFailedMigrationSource( state, siteId ) ||
				isRewindActive( state, siteId ) ||
				siteHasScanProductPurchase( state, siteId ) )
	);
	const translate = useTranslate();

	//todo: this check makes sense in Jetpack section?
	if ( ! siteIsJetpack ) {
		return (
			<JetpackManageErrorPage
				action={ translate( 'Manage general settings for %(site)s', {
					args: { site: site?.name },
				} ) }
				actionURL={ '/settings/general/' + site?.slug }
				title={ translate( 'No Jetpack configuration is required.' ) }
				// line={ translate( 'Security management is automatic for WordPress.com sites.' ) }
				illustration="/calypso/images/illustrations/illustration-jetpack.svg"
			/>
		);
	}

	return (
		<Main className="settings-jetpack site-settings">
			<QueryRewindState siteId={ siteId } />
			<QuerySitePurchases siteId={ siteId } />
			<DocumentHead title={ translate( 'Site Settings' ) } />
			<JetpackDevModeNotice />
			<SidebarNavigation />
			<FormattedHeader
				brandFont
				className="settings-jetpack__page-heading"
				headerText={ translate( 'Settings' ) }
				align="left"
			/>
			<SiteSettingsNavigation site={ site } section="jetpack" />

			{ showCredentials &&
				( isEnabled( 'jetpack/server-credentials-advanced-flow' ) ? (
					<JetpackAdvancedCredentials action={ action } host={ host } role="main" />
				) : (
					<JetpackCredentials />
				) ) }
		</Main>
	);
};

export default SiteSettingsJetpack;
