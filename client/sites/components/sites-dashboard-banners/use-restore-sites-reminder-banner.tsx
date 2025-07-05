import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Notice from 'calypso/dashboard/components/notice';
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
				<div style={ { width: '100%' } }>
					<Notice
						title={ __( 'Choose which sites you’d like to restore' ) }
						onClose={ dismissNotice }
					>
						{ createInterpolateElement(
							__(
								'<restoreSiteLink>Restore sites</restoreSiteLink> from the action menu. You’ll also need to <invitePeopleLink>invite any users</invitePeopleLink> that previously had access to your sites.'
							),
							{
								restoreSiteLink: (
									<InlineSupportLink showIcon={ false } supportContext="restore-site" />
								),
								invitePeopleLink: (
									<InlineSupportLink showIcon={ false } supportContext="invite-people" />
								),
							}
						) }
					</Notice>
				</div>
			);
		},
	};
}
