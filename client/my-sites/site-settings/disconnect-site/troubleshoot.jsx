/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import JetpackConnectHappychatButton from 'jetpack-connect/happychat-button';
import HelpButton from 'jetpack-connect/help-button';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';

const Troubleshoot = ( { trackSupportClick, translate } ) => (
	<div className="disconnect-site__troubleshooting">
		<JetpackConnectHappychatButton
			label={ translate( 'Get help from our Happiness Engineers' ) }
			onClick={ trackSupportClick }
		>
			<HelpButton
				label={ translate( 'Get help from our Happiness Engineers' ) }
				onClick={ trackSupportClick }
			/>
		</JetpackConnectHappychatButton>
	</div>
);

export default connect( null, {
	trackSupportClick: withAnalytics(
		recordTracksEvent( 'calypso_jetpack_disconnect_support_click' )
	),
} )( localize( Troubleshoot ) );
