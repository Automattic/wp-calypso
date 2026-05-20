import { userPreferenceQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Notice } from '@wordpress/ui';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import useSetAchievementsVisibility from 'calypso/reader/components/achievements/use-set-achievements-visibility';
import { recordAction } from 'calypso/reader/stats';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';

import './style.scss';

export default function AchievementsPrivacyNotice() {
	const translate = useTranslate();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();

	const { data: savedVisibility } = useQuery( userPreferenceQuery( 'achievements-visibility' ) );
	const isPrivate = ( savedVisibility ?? 'private' ) === 'private';

	const { setVisibility, isPending } = useSetAchievementsVisibility();

	useEffect( () => {
		if ( isPrivate ) {
			recordReaderTracksEvent( 'calypso_reader_achievements_privacy_notice_displayed' );
		}
	}, [ isPrivate, recordReaderTracksEvent ] );

	if ( ! isPrivate ) {
		return null;
	}

	const handleMakePublic = () => {
		recordAction( 'achievements_privacy_notice_make_public_clicked' );
		recordReaderTracksEvent( 'calypso_reader_achievements_privacy_notice_make_public_clicked' );
		setVisibility( 'public' );
	};

	return (
		<div className="achievements-privacy-notice">
			<Notice.Root intent="info">
				<Notice.Title>{ translate( 'Your achievements are private' ) }</Notice.Title>
				<Notice.Description>
					{ translate(
						'Only you can see them. Share them with the WordPress.com community by making your page public.'
					) }
				</Notice.Description>
				<Notice.Actions>
					<Notice.ActionButton
						onClick={ handleMakePublic }
						loading={ isPending }
						loadingAnnouncement={ translate( 'Making your achievements page public…' ) }
					>
						{ translate( 'Make public' ) }
					</Notice.ActionButton>
				</Notice.Actions>
			</Notice.Root>
		</div>
	);
}
