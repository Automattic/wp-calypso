/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ApiCache from './api-cache';
import PublicPostTypes from './public-post-types';
import CompactCard from 'components/card/compact';
import SectionHeader from 'components/section-header';
import JetpackSyncPanel from 'my-sites/site-settings/jetpack-sync-panel';
import { getSiteUrl } from 'state/selectors';
import { isJetpackMinimumVersion, isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const DataSynchronization = ( {
	siteUrl,
	supportsJetpackSync,
	translate
} ) => {
	if ( ! supportsJetpackSync ) {
		return null;
	}

	return (
		<div>
			<SectionHeader label={ translate( 'Data synchronization' ) } />

			<JetpackSyncPanel />
			<ApiCache />
			<PublicPostTypes />

			<CompactCard href={ 'https://jetpack.com/support/debug/?url=' + siteUrl } target="_blank">
				{ translate( 'Diagnose a connection problem' ) }
			</CompactCard>
		</div>
	);
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const siteIsJetpack = isJetpackSite( state, siteId );

		return {
			siteUrl: getSiteUrl( state, siteId ),
			supportsJetpackSync: siteIsJetpack && isJetpackMinimumVersion( state, siteId, '4.2-alpha' ),
		};
	}
)( localize( DataSynchronization ) );
