import { userPreferenceMutation, userPreferenceQuery } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useColorScheme } from 'calypso/lib/color-scheme';
import { useAnalytics } from '../../app/analytics';
import { useAppContext } from '../../app/context';
import { isDashboardBackport } from '../../utils/is-dashboard-backport';
import { ButtonStack } from '../button-stack';
import ComponentViewTracker from '../component-view-tracker';
import Notice from '../notice';

const DISMISSED_PREFERENCE = 'hosting-dashboard-dark-mode-announcement-dismissed';

export function useShouldShowDarkModeAnnouncement() {
	const config = useAppContext();
	const { data: isDismissedPersisted } = useSuspenseQuery(
		userPreferenceQuery( DISMISSED_PREFERENCE )
	);

	return (
		config.supports.darkMode &&
		config.supports.colorScheme &&
		! isDashboardBackport() &&
		! isDismissedPersisted
	);
}

function DarkModeAnnouncementContent( { tracksContext }: { tracksContext: string } ) {
	const { mutate: dismiss, isPending: isDismissing } = useMutation(
		userPreferenceMutation( DISMISSED_PREFERENCE )
	);
	const { colorScheme, setColorScheme } = useColorScheme();
	const { recordTracksEvent } = useAnalytics();
	const isDarkModeActive = colorScheme === 'dark';
	const handleClose = () => {
		dismiss( new Date().toISOString() );
		recordTracksEvent( 'calypso_dashboard_dark_mode_announcement_dismiss_click', {
			context: tracksContext,
		} );
	};
	const handleToggleDarkMode = () => {
		if ( isDarkModeActive ) {
			setColorScheme( 'light', {
				onSuccess: () => {
					recordTracksEvent( 'calypso_dashboard_dark_mode_announcement_revert_click', {
						context: tracksContext,
					} );
				},
			} );
			return;
		}

		setColorScheme( 'dark', {
			onSuccess: () => {
				recordTracksEvent( 'calypso_dashboard_dark_mode_announcement_try_dark_click', {
					context: tracksContext,
				} );
			},
		} );
	};

	if ( isDismissing ) {
		return null;
	}

	return (
		<Notice
			onClose={ handleClose }
			variant="info"
			actions={
				<ButtonStack justify="flex-start">
					<Button variant="primary" size="compact" onClick={ handleToggleDarkMode }>
						{ isDarkModeActive ? __( 'Go back to light mode' ) : __( 'Try dark mode' ) }
					</Button>
					<Button
						variant="secondary"
						size="compact"
						aria-label={ __( 'Dismiss dark mode announcement' ) }
						onClick={ handleClose }
					>
						{ __( 'Dismiss' ) }
					</Button>
				</ButtonStack>
			}
		>
			<ComponentViewTracker
				eventName="calypso_dashboard_dark_mode_announcement_impression"
				properties={ { context: tracksContext } }
			/>
			{ createInterpolateElement(
				__(
					'Dark mode support is now available in the dashboard. You can change your choice (or set it to match your system) in the <appearanceLink>Appearance settings</appearanceLink>.'
				),
				{
					appearanceLink: (
						<Link
							to="/me/preferences/appearance"
							onClick={ () => {
								recordTracksEvent( 'calypso_dashboard_dark_mode_announcement_appearance_click', {
									context: tracksContext,
								} );
							} }
						/>
					),
				}
			) }
		</Notice>
	);
}

export function DarkModeAnnouncement( { tracksContext }: { tracksContext: string } ) {
	const shouldShow = useShouldShowDarkModeAnnouncement();

	if ( ! shouldShow ) {
		return null;
	}

	return <DarkModeAnnouncementContent tracksContext={ tracksContext } />;
}
