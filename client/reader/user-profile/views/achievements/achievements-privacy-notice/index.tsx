import { userPreferenceQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Notice } from '@wordpress/ui';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';

import './style.scss';

export default function AchievementsPrivacyNotice() {
	const translate = useTranslate();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();

	const { data: savedVisibility } = useQuery( userPreferenceQuery( 'achievements-visibility' ) );
	const isPrivate = ( savedVisibility ?? 'private' ) === 'private';

	useEffect( () => {
		if ( isPrivate ) {
			recordReaderTracksEvent( 'calypso_reader_achievements_privacy_notice_displayed' );
		}
	}, [ isPrivate, recordReaderTracksEvent ] );

	if ( ! isPrivate ) {
		return null;
	}

	return (
		<div className="achievements-privacy-notice">
			<Notice.Root intent="info">
				<Notice.Title>{ translate( 'Your achievements are private' ) }</Notice.Title>
				<Notice.Description>
					{ translate(
						'Only you can see them. Open the achievement settings below to share them with the WordPress.com community.'
					) }
				</Notice.Description>
			</Notice.Root>
		</div>
	);
}
