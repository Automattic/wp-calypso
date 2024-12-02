import { CompactCard } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Fragment } from 'react';
import { connect } from 'react-redux';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import getSiteUrl from 'calypso/state/selectors/get-site-url';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ApiCache from './api-cache';
import JetpackSyncPanel from './jetpack-sync-panel';

const DataSynchronization = ( { siteUrl, siteIsJetpack, translate } ) => {
	if ( ! siteIsJetpack ) {
		return null;
	}

	return (
		<Fragment>
			<SettingsSectionHeader title={ translate( 'Data synchronization' ) } />

			<JetpackSyncPanel />
			<ApiCache />

			<CompactCard href={ 'https://jetpack.com/support/debug/?url=' + siteUrl } target="_blank">
				{ translate( 'Diagnose a connection problem' ) }
			</CompactCard>
		</Fragment>
	);
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteIsJetpack: isJetpackSite( state, siteId ),
		siteUrl: getSiteUrl( state, siteId ),
	};
} )( localize( DataSynchronization ) );
