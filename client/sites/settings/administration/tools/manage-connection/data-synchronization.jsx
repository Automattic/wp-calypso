import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { PanelHeading, PanelSection } from 'calypso/components/panel';
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
		<PanelSection>
			<PanelHeading>{ translate( 'Data synchronization' ) }</PanelHeading>

			<JetpackSyncPanel />
			<ApiCache />

			<Button href={ 'https://jetpack.com/support/debug/?url=' + siteUrl } target="_blank">
				{ translate( 'Diagnose a connection problem' ) }
			</Button>
		</PanelSection>
	);
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteIsJetpack: isJetpackSite( state, siteId ),
		siteUrl: getSiteUrl( state, siteId ),
	};
} )( localize( DataSynchronization ) );
