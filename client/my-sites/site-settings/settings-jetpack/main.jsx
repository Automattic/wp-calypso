import config from '@automattic/calypso-config';
import { WPCOM_FEATURES_SCAN } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect, useSelector } from 'react-redux';
import AdvancedCredentials from 'calypso/components/advanced-credentials';
import BackupRetentionManagement from 'calypso/components/backup-retention-management';
import DocumentHead from 'calypso/components/data/document-head';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import HasRetentionCapabilitiesSwitch from 'calypso/jetpack-cloud/sections/settings/has-retention-capabilities-switch';
import AdvancedCredentialsLoadingPlaceholder from 'calypso/jetpack-cloud/sections/settings/loading';
import JetpackDevModeNotice from 'calypso/my-sites/site-settings/jetpack-dev-mode-notice';
import SiteSettingsNavigation from 'calypso/my-sites/site-settings/navigation';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import isRewindActive from 'calypso/state/selectors/is-rewind-active';
import isSiteFailedMigrationSource from 'calypso/state/selectors/is-site-failed-migration-source';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

const SiteSettingsJetpack = ( {
	site,
	siteId,
	siteIsJetpack,
	showCredentials,
	host,
	action,
	translate,
	retention,
	storagePurchased,
} ) => {
	// Sites hosted on WordPress.com cannot modify Jetpack credentials
	const isAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, siteId ) );
	const managedJetpackCreds = ! siteIsJetpack || isAtomic;
	if ( managedJetpackCreds ) {
		return (
			<EmptyContent
				action={ translate( 'Manage general settings for %(site)s', {
					args: { site: site.name },
				} ) }
				actionURL={ '/settings/general/' + site.slug }
				title={ translate( 'No Jetpack configuration is required.' ) }
				// line={ translate( 'Security management is automatic for WordPress.com sites.' ) }
			/>
		);
	}

	return (
		<Main className="settings-jetpack site-settings">
			<QueryRewindState siteId={ siteId } />
			<QuerySiteFeatures siteIds={ [ siteId ] } />
			<DocumentHead title={ translate( 'Jetpack Settings' ) } />
			<JetpackDevModeNotice />
			<NavigationHeader navigationItems={ [] } title={ translate( 'Jetpack Settings' ) } />
			<SiteSettingsNavigation site={ site } section="jetpack" />
			{ config.isEnabled( 'jetpack/backup-retention-settings' ) ? (
				// @TODO: Maybe we should move HasRetentionCapabilitiesSwitch to BackupRetentionManagement
				// component
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
			{ showCredentials && <AdvancedCredentials action={ action } host={ host } role="main" /> }
		</Main>
	);
};

SiteSettingsJetpack.propTypes = {
	site: PropTypes.object,
	siteId: PropTypes.number,
	siteIsJetpack: PropTypes.bool,
	showCredentials: PropTypes.bool,
};

export default connect( ( state ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const { host, action } = getCurrentQueryArguments( state );

	// This parameter is useful to redirect back from checkout page and select the retention period
	// the customer previously selected.
	const retention = Number.isInteger( Number( getCurrentQueryArguments( state ).retention ) )
		? Number( getCurrentQueryArguments( state ).retention )
		: undefined;

	// It means that the customer has purchased storage
	const storagePurchased = Boolean( getCurrentQueryArguments( state ).storage_purchased );

	return {
		site,
		siteId,
		siteIsJetpack: isJetpackSite( state, siteId ),
		showCredentials:
			isSiteFailedMigrationSource( state, siteId ) ||
			isRewindActive( state, siteId ) ||
			siteHasFeature( state, siteId, WPCOM_FEATURES_SCAN ),
		host,
		action,
		retention,
		storagePurchased,
	};
} )( localize( SiteSettingsJetpack ) );
