import { userPreferenceQuery, userPreferenceOptimisticMutation } from '@automattic/api-queries';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button, Dropdown, ToggleControl } from '@wordpress/components';
import { settings } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { recordAction } from 'calypso/reader/stats';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';

import './style.scss';

export default function AchievementsSettings() {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();

	const { data: savedNotifications } = useQuery(
		userPreferenceQuery( 'achievements-global-notifications' )
	);

	// Local state for immediate toggle feedback. Synced from query data on load.
	const [ notifications, setLocalNotifications ] = useState( savedNotifications ?? 'enabled' );
	useEffect(
		() => setLocalNotifications( savedNotifications ?? 'enabled' ),
		[ savedNotifications ]
	);

	const { mutate: setNotifications } = useMutation(
		userPreferenceOptimisticMutation( 'achievements-global-notifications' )
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
					setting: 'achievements-notifications',
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
		<Dropdown
			popoverProps={ {
				className: 'achievements-settings__popover',
				placement: 'bottom-end',
				offset: 8,
				noArrow: false,
			} }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					className="achievements-settings__button"
					onClick={ () => {
						if ( ! isOpen ) {
							recordAction( 'open_achievements_settings_popover' );
							recordReaderTracksEvent( 'calypso_reader_achievements_settings_popover_opened' );
						}
						onToggle();
					} }
					aria-expanded={ isOpen }
					icon={ settings }
					label={ translate( 'Achievement settings' ) }
				/>
			) }
			renderContent={ () => (
				<div className="achievements-settings__content">
					<ToggleControl
						checked={ notifications !== 'disabled' }
						onChange={ handleSetNotifications }
						label={ translate( 'Achievement notifications' ) }
						help={ translate(
							'Receive notifications when you unlock new achievements. This overrides {{a}}site-level settings{{/a}}.',
							{
								components: {
									a: <a href="/me/notifications" />,
								},
							}
						) }
					/>
				</div>
			) }
		/>
	);
}
