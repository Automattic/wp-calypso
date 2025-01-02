import { NoticeBanner } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
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
			const urlParams = new URLSearchParams( window.location.search );
			const restored = urlParams.get( 'restored' );
			return ! isDismissed && restored === 'true';
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
							'You’ll need to invite any users that previously had access to your sites.'
						) }
					</div>
				</NoticeBanner>
			);
		},
	};
}
