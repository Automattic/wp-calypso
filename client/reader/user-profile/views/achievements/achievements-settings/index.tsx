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

	const { data: savedIsPublic } = useQuery( userPreferenceQuery( 'achievements-page-public' ) );
	const { data: savedNotifications } = useQuery(
		userPreferenceQuery( 'achievements-notifications-enabled' )
	);

	const [ isPublic, setIsPublic ] = useState( !! savedIsPublic );
	const [ notificationsEnabled, setNotificationsEnabled ] = useState(
		savedNotifications !== false
	);

	// Sync local state when server data changes (e.g. on initial load).
	useEffect( () => setIsPublic( !! savedIsPublic ), [ savedIsPublic ] );
	useEffect(
		() => setNotificationsEnabled( savedNotifications !== false ),
		[ savedNotifications ]
	);

	const { mutate: setPublic, isPending: isSetPublicPending } = useMutation(
		userPreferenceOptimisticMutation( 'achievements-page-public' )
	);
	const { mutate: setNotifications, isPending: isSetNotificationsPending } = useMutation(
		userPreferenceOptimisticMutation( 'achievements-notifications-enabled' )
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

	const handleSetPublic = ( value: boolean ) => {
		setPublic( value, {
			onSuccess( _, data ) {
				setIsPublic( !! data );
				if ( data ) {
					dispatchSuccessNotice( translate( 'The achievements page is now public.' ) );
					recordAction( 'set_achievements_page_public' );
					recordReaderTracksEvent( 'calypso_reader_achievements_settings_saved', {
						setting: 'achievements-page-visibility',
						value: 'public',
					} );
				} else {
					dispatchSuccessNotice( translate( 'The achievements page is now private.' ) );
					recordAction( 'set_achievements_page_private' );
					recordReaderTracksEvent( 'calypso_reader_achievements_settings_saved', {
						setting: 'achievements-page-visibility',
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
		setNotifications( value, {
			onSuccess( _, data ) {
				setNotificationsEnabled( !! data );
				if ( data ) {
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
						disabled={ isSetPublicPending }
						onChange={ handleSetPublic }
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
