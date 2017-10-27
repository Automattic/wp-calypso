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
import HelpButton from 'jetpack-connect/help-button';
import JetpackConnectHappychatButton from 'jetpack-connect/happychat-button';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import { getSelectedSiteSlug } from 'state/ui/selectors';

const Troubleshoot = ( { siteSlug, trackDebugClick, trackSupportClick, translate } ) => (
	<LoggedOutFormLinks>
		<LoggedOutFormLinkItem
			href={ 'https://jetpack.com/support/debug/?url=' + siteSlug }
			onClick={ trackDebugClick }
		>
			{ translate( 'Diagnose a connection problem' ) }
		</LoggedOutFormLinkItem>
		<JetpackConnectHappychatButton
			label={ translate( 'Get help from our Happiness Engineers' ) }
			onClick={ trackSupportClick }
		>
			<HelpButton
				label={ translate( 'Get help from our Happiness Engineers' ) }
				onClick={ trackSupportClick }
			/>
		</JetpackConnectHappychatButton>
	</LoggedOutFormLinks>
);

export default connect(
	state => ( {
		siteSlug: getSelectedSiteSlug( state ),
	} ),
	{
		trackDebugClick: withAnalytics( recordTracksEvent( 'calypso_jetpack_disconnect_debug_click' ) ),
		trackSupportClick: withAnalytics(
			recordTracksEvent( 'calypso_jetpack_disconnect_support_click' )
		),
	}
)( localize( Troubleshoot ) );
