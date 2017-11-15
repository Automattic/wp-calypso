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
import HelpButton from 'jetpack-connect/help-button';
import JetpackConnectHappychatButton from 'jetpack-connect/happychat-button';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import addQueryArgs from 'lib/route/add-query-args';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import { getSiteUrl, isSiteOnFreePlan } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

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
