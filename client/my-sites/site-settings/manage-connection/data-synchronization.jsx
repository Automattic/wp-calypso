/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ApiCache from './api-cache';
import { CompactCard } from '@automattic/components';
import JetpackSyncPanel from 'my-sites/site-settings/jetpack-sync-panel';
import SettingsSectionHeader from 'my-sites/site-settings/settings-section-header';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import getSiteUrl from 'state/selectors/get-site-url';

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
