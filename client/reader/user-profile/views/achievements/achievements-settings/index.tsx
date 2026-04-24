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

	const { data: savedVisibility } = useQuery( userPreferenceQuery( 'achievements-visibility' ) );
	const { data: savedNotifications } = useQuery(
		userPreferenceQuery( 'achievements-global-notifications' )
	);

	const [ isPublic, setIsPublic ] = useState( savedVisibility === 'public' );
	const [ notificationsEnabled, setNotificationsEnabled ] = useState(
		savedNotifications === 'enabled'
	);

	// Sync local state when server data changes (e.g. on initial load).
	useEffect( () => setIsPublic( savedVisibility === 'public' ), [ savedVisibility ] );
	useEffect(
		() => setNotificationsEnabled( savedNotifications === 'enabled' ),
		[ savedNotifications ]
	);

	const { mutate: setVisibility, isPending: isSetVisibilityPending } = useMutation(
		userPreferenceOptimisticMutation( 'achievements-visibility' )
	);
	const { mutate: setNotifications, isPending: isSetNotificationsPending } = useMutation(
		userPreferenceOptimisticMutation( 'achievements-global-notifications' )
	);

	const dispatchSuccessNotice = ( message: string ) => {
		dispatch(
			successNotice( message, {
				duration: 4000,
			} )
		);
	};
	const dispatchErrorNotice = ( message: string ) => {
		dispatch(
			errorNotice( message, {
				duration: 4000,
			} )
		);
	};

	const handleSetVisibility = ( value: boolean ) => {
		const visibility = value ? 'public' : 'private';
		setVisibility( visibility, {
			onSuccess( _, data ) {
				setIsPublic( data === 'public' );
				if ( data === 'public' ) {
					dispatchSuccessNotice( translate( 'The achievements page is now public.' ) );
					recordAction( 'set_achievements_visibility_public' );
					recordReaderTracksEvent( 'calypso_reader_achievements_settings_saved', {
						setting: 'achievements-visibility',
						value: 'public',
					} );
				} else {
					dispatchSuccessNotice( translate( 'The achievements page is now private.' ) );
					recordAction( 'set_achievements_visibility_private' );
					recordReaderTracksEvent( 'calypso_reader_achievements_settings_saved', {
						setting: 'achievements-visibility',
						value: 'private',
					} );
				}
			},
			onError() {
				dispatchErrorNotice( translate( 'Failed to save the achievements page settings.' ) );
			},
		} );
	};

	const handleSetNotifications = ( value: boolean ) => {
		const notifications = value ? 'enabled' : 'disabled';
		setNotifications( notifications, {
			onSuccess( _, data ) {
				setNotificationsEnabled( data === 'enabled' );
				if ( data === 'enabled' ) {
					dispatchSuccessNotice( translate( 'Achievements notifications are now enabled.' ) );
					recordAction( 'set_achievements_notifications_enabled' );
					recordReaderTracksEvent( 'calypso_reader_achievements_settings_saved', {
						setting: 'achievements-notifications',
						value: 'enabled',
					} );
				} else {
					dispatchSuccessNotice( translate( 'Achievements notifications are now disabled.' ) );
					recordAction( 'set_achievements_notifications_disabled' );
					recordReaderTracksEvent( 'calypso_reader_achievements_settings_saved', {
						setting: 'achievements-notifications',
						value: 'disabled',
					} );
				}
			},
			onError() {
				dispatchErrorNotice(
					translate( 'Failed to save the achievements notifications settings.' )
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
						checked={ isPublic }
						disabled={ isSetVisibilityPending }
						onChange={ handleSetVisibility }
						label={ translate( 'Public achievements' ) }
						help={ translate( 'When enabled, your achievements page is visible to other users.' ) }
					/>
					<ToggleControl
						checked={ notificationsEnabled }
						disabled={ isSetNotificationsPending }
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
