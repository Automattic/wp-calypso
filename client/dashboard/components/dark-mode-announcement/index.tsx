import { userPreferenceMutation, userPreferenceQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { useAppContext } from '../../app/context';
import ComponentViewTracker from '../component-view-tracker';
import Notice from '../notice';

const DISMISSED_PREFERENCE = 'hosting-dashboard-dark-mode-announcement-dismissed';

export function useShouldShowDarkModeAnnouncement() {
	const config = useAppContext();
	const { data: dashboardOptIn } = useSuspenseQuery(
		userPreferenceQuery( 'hosting-dashboard-opt-in' )
	);
	const { data: isDismissedPersisted } = useSuspenseQuery(
		userPreferenceQuery( DISMISSED_PREFERENCE )
	);
	const isDashboardEnrolled =
		dashboardOptIn?.value === 'opt-in' ||
		dashboardOptIn?.value === 'forced-opt-in' ||
		isEnabled( 'dashboard/forced-opt-in' );

	return (
		config.optIn && config.supports.colorScheme && isDashboardEnrolled && ! isDismissedPersisted
	);
}

function DarkModeAnnouncementContent( { tracksContext }: { tracksContext: string } ) {
	const { mutate: dismiss, isPending: isDismissing } = useMutation(
		userPreferenceMutation( DISMISSED_PREFERENCE )
	);
	const { recordTracksEvent } = useAnalytics();
	const handleClose = () => {
		dismiss( new Date().toISOString() );
		recordTracksEvent( 'calypso_dashboard_dark_mode_announcement_dismiss_click', {
			context: tracksContext,
		} );
	};

	if ( isDismissing ) {
		return null;
	}

	return (
		<Notice onClose={ handleClose } variant="info">
			<ComponentViewTracker
				eventName="calypso_dashboard_dark_mode_announcement_impression"
				properties={ { context: tracksContext } }
			/>
			{ createInterpolateElement(
				__(
					'Dark mode is now available in the Hosting Dashboard. Test it from <appearanceLink>Appearance settings</appearanceLink>.'
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
