/** @format */
/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import HelpButton from 'client/jetpack-connect/help-button';
import JetpackConnectHappychatButton from 'client/jetpack-connect/happychat-button';
import LoggedOutFormLinkItem from 'client/components/logged-out-form/link-item';
import LoggedOutFormLinks from 'client/components/logged-out-form/links';
import addQueryArgs from 'client/lib/route/add-query-args';
import { recordTracksEvent, withAnalytics } from 'client/state/analytics/actions';
import { getSiteUrl, isSiteOnFreePlan } from 'client/state/selectors';
import { getSelectedSiteId } from 'client/state/ui/selectors';

const Troubleshoot = ( { isFreePlan, siteUrl, trackDebugClick, trackSupportClick, translate } ) => (
	<LoggedOutFormLinks>
		<LoggedOutFormLinkItem
			href={ addQueryArgs( { url: siteUrl }, 'https://jetpack.com/support/debug/' ) }
			onClick={ trackDebugClick }
		>
			<Gridicon size={ 18 } icon="offline" /> { translate( 'Diagnose a connection problem' ) }
		</LoggedOutFormLinkItem>
		{ isFreePlan ? (
			<HelpButton
				label={ translate( 'Get help from our Happiness Engineers' ) }
				onClick={ trackSupportClick }
			/>
		) : (
			<JetpackConnectHappychatButton
				label={ translate( 'Get help from our Happiness Engineers' ) }
				eventName="calypso_jetpack_disconnect_chat_initiated"
			>
				<HelpButton
					label={ translate( 'Get help from our Happiness Engineers' ) }
					onClick={ trackSupportClick }
				/>
			</JetpackConnectHappychatButton>
		) }
	</LoggedOutFormLinks>
);

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		return {
			siteUrl: getSiteUrl( state, siteId ),
			isFreePlan: isSiteOnFreePlan( state, siteId ),
		};
	},
	{
		trackDebugClick: withAnalytics( recordTracksEvent( 'calypso_jetpack_disconnect_debug_click' ) ),
		trackSupportClick: withAnalytics(
			recordTracksEvent( 'calypso_jetpack_disconnect_support_click' )
		),
	}
)( localize( Troubleshoot ) );
