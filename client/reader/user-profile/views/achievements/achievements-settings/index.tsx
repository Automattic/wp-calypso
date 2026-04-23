import { userPreferenceQuery, userPreferenceOptimisticMutation } from '@automattic/api-queries';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button, Dropdown, ToggleControl } from '@wordpress/components';
import { settings } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

export default function AchievementsSettings() {
	const translate = useTranslate();

	const { data: isPublic } = useQuery( userPreferenceQuery( 'achievements-page-public' ) );
	const { data: notificationsEnabled } = useQuery(
		userPreferenceQuery( 'achievements-notifications-enabled' )
	);

	const { mutate: setPublic } = useMutation(
		userPreferenceOptimisticMutation( 'achievements-page-public' )
	);
	const { mutate: setNotifications } = useMutation(
		userPreferenceOptimisticMutation( 'achievements-notifications-enabled' )
	);

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
					onClick={ onToggle }
					aria-expanded={ isOpen }
					icon={ settings }
					label={ translate( 'Achievement settings' ) }
				/>
			) }
			renderContent={ () => (
				<div className="achievements-settings__content">
					<ToggleControl
						checked={ !! isPublic }
						onChange={ ( value ) => setPublic( value ) }
						label={ translate( 'Public achievements' ) }
						help={ translate( 'When enabled, your achievements page is visible to other users.' ) }
					/>
					<ToggleControl
						checked={ notificationsEnabled !== false }
						onChange={ ( value ) => setNotifications( value ) }
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
