import { userPreferenceQuery, userPreferenceMutation } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { starEmpty } from '@wordpress/icons';
import { useAnalytics } from '../../app/analytics';
import { useAppContext } from '../../app/context';
import Notice from '../../components/notice';
import ComponentViewTracker from '../component-view-tracker';

export function OptInWelcome( { tracksContext }: { tracksContext: string } ) {
	const { optIn } = useAppContext();
	const { data: dashboardOptIn } = useSuspenseQuery(
		userPreferenceQuery( 'hosting-dashboard-opt-in' )
	);
	const { data: isDismissedPersisted } = useSuspenseQuery(
		userPreferenceQuery( 'hosting-dashboard-welcome-notice-dismissed' )
	);
	const { mutate: dismiss, isPending: isDismissing } = useMutation(
		userPreferenceMutation( 'hosting-dashboard-welcome-notice-dismissed' )
	);
	const { recordTracksEvent } = useAnalytics();

	const handleClose = () => {
		dismiss( new Date().toISOString() );
		recordTracksEvent( 'calypso_dashboard_welcome_banner_dismiss_click', {
			context: tracksContext,
		} );
	};

	if ( ! optIn || dashboardOptIn?.value === 'forced-opt-in' ) {
		return null;
	}

	// Optimistically hide the banner assuming the preference will get saved.
	if ( isDismissing || isDismissedPersisted ) {
		return null;
	}

	return (
		<Notice onClose={ handleClose } variant="info" icon={ starEmpty }>
			<ComponentViewTracker
				eventName="calypso_dashboard_welcome_banner_impression"
				properties={ { context: tracksContext } }
			/>
			{ createInterpolateElement(
				__(
					'Welcome to your new Hosting Dashboard. Share your feedback anytime by <feedbackLink>clicking here</feedbackLink>. To switch back to the previous version, go to <preferencesLink>Preferences</preferencesLink>.'
				),
				{
					preferencesLink: (
						<Link
							to="/me/preferences"
							onClick={ () => {
								recordTracksEvent( 'calypso_dashboard_welcome_banner_preferences_click', {
									context: tracksContext,
								} );
							} }
						/>
					),
					feedbackLink: (
						<ExternalLink
							href="https://automattic.survey.fm/msd-survey-for-opt-in"
							onClick={ () =>
								recordTracksEvent( 'calypso_dashboard_welcome_banner_survey_click', {
									context: tracksContext,
								} )
							}
							children={ null }
						/>
					),
				}
			) }
		</Notice>
	);
}
