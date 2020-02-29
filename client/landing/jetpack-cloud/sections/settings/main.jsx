/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import React from 'react';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import getRewindState from 'state/selectors/get-rewind-state';
import getRewindStateRequestStatus from 'state/selectors/get-rewind-state-request-status';

import QueryRewindState from 'components/data/query-rewind-state';
import ServerConnectionIndicator from '../../components/server-connection-indicator';
import ServerConnectionIndicatorPlaceholder from '../../components/server-connection-indicator/placeholder';

const SettingsPage = () => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const rewindStateRequestStatus = useSelector( state =>
		getRewindStateRequestStatus( state, selectedSiteId )
	);
	const rewindState = useSelector( state => getRewindState( state, selectedSiteId ) );

	const isConnected = rewindState && rewindState.state === 'active';

	return (
		<div>
			{ selectedSiteId && <QueryRewindState siteId={ selectedSiteId } /> }
			{ /* @todo: actual placeholder component here */ }
			{ rewindStateRequestStatus === 'success' ? (
				<ServerConnectionIndicator isConnected={ isConnected } />
			) : (
				<ServerConnectionIndicatorPlaceholder />
			) }
		</div>
	);
};

export default SettingsPage;
