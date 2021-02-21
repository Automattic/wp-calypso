/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'calypso/components/gridicon';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import HelpButton from 'calypso/jetpack-connect/help-button';
import JetpackConnectHappychatButton from 'calypso/jetpack-connect/happychat-button';
import LoggedOutFormLinkItem from 'calypso/components/logged-out-form/link-item';
import LoggedOutFormLinks from 'calypso/components/logged-out-form/links';
import { addQueryArgs } from 'calypso/lib/route';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';
import getSiteUrl from 'calypso/state/selectors/get-site-url';
import isSiteOnFreePlan from 'calypso/state/selectors/is-site-on-free-plan';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const Troubleshoot = ( { isFreePlan, siteUrl, trackDebugClick, translate } ) => (
	<LoggedOutFormLinks>
		<LoggedOutFormLinkItem
			href={ addQueryArgs( { url: siteUrl }, 'https://jetpack.com/support/debug/' ) }
			onClick={ trackDebugClick }
		>
			<Gridicon size={ 18 } icon="offline" /> { translate( 'Diagnose a connection problem' ) }
		</LoggedOutFormLinkItem>
		{ isFreePlan ? (
			<HelpButton label={ translate( 'Get help from our Happiness Engineers' ) } />
		) : (
			<JetpackConnectHappychatButton
				label={ translate( 'Get help from our Happiness Engineers' ) }
				eventName="calypso_jetpack_disconnect_chat_initiated"
			>
				<HelpButton label={ translate( 'Get help from our Happiness Engineers' ) } />
			</JetpackConnectHappychatButton>
		) }
	</LoggedOutFormLinks>
);

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		return {
			siteUrl: getSiteUrl( state, siteId ),
			isFreePlan: isSiteOnFreePlan( state, siteId ),
		};
	},
	{
		trackDebugClick: withAnalytics( recordTracksEvent( 'calypso_jetpack_disconnect_debug_click' ) ),
	}
)( localize( Troubleshoot ) );
