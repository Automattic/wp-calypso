import { userPreferenceQuery, userPreferenceOptimisticMutation } from '@automattic/api-queries';
import { Card } from '@automattic/components';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { recordAction } from 'calypso/reader/stats';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';

import './style.scss';

export default function AchievementsNotificationSettings() {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();

	const { data: savedNotifications, isLoading } = useQuery(
		userPreferenceQuery( 'achievements-global-notifications' )
	);
	const { mutate: setNotifications } = useMutation(
		userPreferenceOptimisticMutation( 'achievements-global-notifications' )
	);

	// Local state for immediate toggle feedback. Synced from query data on load.
	const [ notifications, setLocalNotifications ] = useState( savedNotifications ?? 'enabled' );
	useEffect(
		() => setLocalNotifications( savedNotifications ?? 'enabled' ),
		[ savedNotifications ]
	);

	const handleSetNotifications = ( checked: boolean ) => {
		const newNotifications = checked ? 'enabled' : 'disabled';
		setLocalNotifications( newNotifications );
		setNotifications( newNotifications, {
			onSuccess() {
				dispatch(
					successNotice(
						newNotifications === 'enabled'
							? translate( 'Achievements notifications are now enabled.' )
							: translate( 'Achievements notifications are now disabled.' ),
						{ duration: 4000 }
					)
				);
				recordAction( `set_achievements_notifications_${ newNotifications }` );
				recordReaderTracksEvent( 'calypso_reader_achievements_settings_saved', {
					setting: 'me-achievements-notifications',
					value: newNotifications,
				} );
			},
			onError() {
				dispatch(
					errorNotice( translate( 'Failed to save the achievements notifications settings.' ), {
						duration: 4000,
					} )
				);
			},
		} );
	};

	return (
		<Card
			id="achievements"
			className="notification-settings-achievements-notification-settings__settings"
		>
			<ToggleControl
				__nextHasNoMarginBottom
				checked={ notifications !== 'disabled' }
				disabled={ isLoading }
				help={ translate(
					'Receive notifications when you unlock new achievements. This setting overrides site-level settings.'
				) }
				label={ translate( 'Achievements' ) }
				onChange={ handleSetNotifications }
			/>
		</Card>
	);
}
