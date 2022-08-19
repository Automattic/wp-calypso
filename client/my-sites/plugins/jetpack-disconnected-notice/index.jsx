import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import {
	recordTracksEvent,
	recordGoogleEvent,
	composeAnalytics,
} from 'calypso/state/analytics/actions';
import getSiteConnectionStatus from 'calypso/state/selectors/get-site-connection-status';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const JetpackDisconnectedNotice = () => {
	const selectedSite = useSelector( getSelectedSite );

	const isSiteConnected = useSelector( ( state ) =>
		getSiteConnectionStatus( state, selectedSite?.ID )
	);

	const trackSiteDisconnect = () =>
		composeAnalytics(
			recordGoogleEvent( 'Jetpack', 'Clicked in site indicator to start Jetpack Disconnect flow' ),
			recordTracksEvent( 'calypso_jetpack_site_indicator_disconnect_start' )
		);

	const translate = useTranslate();

	return (
		<>
			{ isSiteConnected === false && (
				<Notice
					icon="notice"
					showDismiss={ false }
					status="is-warning"
					text={ translate( '%(siteName)s cannot be accessed.', {
						textOnly: true,
						args: { siteName: selectedSite.title },
					} ) }
				>
					<NoticeAction
						onClick={ trackSiteDisconnect }
						href={ `/settings/disconnect-site/${ selectedSite.slug }?type=down` }
					>
						{ translate( 'I’d like to fix this now' ) }
					</NoticeAction>
				</Notice>
			) }
		</>
	);
};

export default JetpackDisconnectedNotice;
