import { NoticeBanner } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './styles.scss';

export function useRestoreSitesBanner() {
	const id = 'restore-sites-reminder';
	// Show banner when ?restored=true param exists, even if previously dismissed
	const [ isDismissed, setIsDismissed ] = useState( false );

	const dismissNotice = () => {
		recordTracksEvent( 'calypso_sites_dashboard_restore_banner_dismiss' );
		setIsDismissed( true );
	};

	return {
		id,
		shouldShow() {
			if ( isDismissed ) {
				return false;
			}
			// Show banner when ?restored=true param exists
			const urlParams = new URLSearchParams( window.location.search );
			const restored = urlParams.get( 'restored' );
			return restored === 'true';
		},
		render() {
			return (
				<NoticeBanner
					title={ translate( 'Choose which sites you’d like to restore' ) }
					onClose={ dismissNotice }
					level="info"
				>
					<div>
						{ translate(
							`{{restoreSiteLink}}Restore sites{{/restoreSiteLink}} from the action menu. You'll also need to {{invitePeopleLink}}invite any users{{/invitePeopleLink}} that previously had access to your sites.`,
							{
								components: {
									restoreSiteLink: (
										<InlineSupportLink showIcon={ false } supportContext="restore-site" />
									),
									invitePeopleLink: (
										<InlineSupportLink showIcon={ false } supportContext="invite-people" />
									),
								},
							}
						) }
					</div>
				</NoticeBanner>
			);
		},
	};
}
