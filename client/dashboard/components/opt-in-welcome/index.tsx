import { userPreferenceQuery, userPreferenceMutation } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { starEmpty } from '@wordpress/icons';
import { useAnalytics } from '../../app/analytics';
import Notice from '../../components/notice';

export function OptInWelcome( { tracksContext }: { tracksContext: string } ) {
	const { data: isDismissedPersisted } = useSuspenseQuery(
		userPreferenceQuery( 'hosting-dashboard-welcome-notice-dismissed' )
	);
	const { mutate: dismiss, isPending: isDismissing } = useMutation(
		userPreferenceMutation( 'hosting-dashboard-welcome-notice-dismissed' )
	);
	const { recordTracksEvent } = useAnalytics();

	// Optimistically hide the banner assuming the preference will get saved.
	if ( isDismissing || isDismissedPersisted ) {
		return null;
	}

	return (
		<Notice onClose={ () => dismiss( new Date().toISOString() ) } variant="info" icon={ starEmpty }>
			{ createInterpolateElement(
				__(
					'Welcome to your new hosting dashboard. Share your feedback anytime by <feedbackLink>clicking here</feedbackLink>. To switch back to the previous version, go to <preferencesLink>Preferences</preferencesLink>.'
				),
				{
					preferencesLink: <Link to="/me/preferences" />,
					feedbackLink: (
						<ExternalLink
							href="https://automattic.survey.fm/new-hosting-dashboard-opt-in-survey"
							onClick={ () =>
								recordTracksEvent( 'calypso_hosting_dashboard_welcome_banner_survey_click', {
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
