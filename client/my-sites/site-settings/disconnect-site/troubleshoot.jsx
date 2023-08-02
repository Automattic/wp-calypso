import { Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import LoggedOutFormLinkItem from 'calypso/components/logged-out-form/link-item';
import LoggedOutFormLinks from 'calypso/components/logged-out-form/links';
import HelpButton from 'calypso/jetpack-connect/help-button';
import { addQueryArgs } from 'calypso/lib/route';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';
import getSiteUrl from 'calypso/state/selectors/get-site-url';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const Troubleshoot = ( { siteUrl, trackDebugClick, translate } ) => (
	<LoggedOutFormLinks>
		<LoggedOutFormLinkItem
			href={ addQueryArgs( { url: siteUrl }, 'https://jetpack.com/support/debug/' ) }
			onClick={ trackDebugClick }
		>
			<Gridicon size={ 18 } icon="offline" /> { translate( 'Diagnose a connection problem' ) }
		</LoggedOutFormLinkItem>
		<HelpButton label={ translate( 'Get help from our Happiness Engineers' ) } />
	</LoggedOutFormLinks>
);

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		return {
			siteUrl: getSiteUrl( state, siteId ),
		};
	},
	{
		trackDebugClick: withAnalytics( recordTracksEvent( 'calypso_jetpack_disconnect_debug_click' ) ),
	}
)( localize( Troubleshoot ) );
