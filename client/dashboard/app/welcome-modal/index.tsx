import { userPreferenceQuery, userPreferenceMutation } from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { useMatch } from '@tanstack/react-router';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	Button,
	ExternalLink,
	Guide,
} from '@wordpress/components';
import { __, isRTL } from '@wordpress/i18n';
import ComponentViewTracker from '../../components/component-view-tracker';
import { isWelcomeModalEligible } from '../../utils/hosting-dashboard-enrollment';
import { useAnalytics } from '../analytics';
import { useAuth } from '../auth';
import { hostingDashboardRoute as hostingDashboardPreferencesRoute } from '../router/me';
import patternUrl from './welcome-modal-background-pattern.png';
import illustrationRtlUrl from './welcome-modal-illustration-rtl.png';
import illustrationUrl from './welcome-modal-illustration.png';
import './style.scss';

const preferenceName = 'hosting-dashboard-opt-in-welcome-modal-dismissed' as const;

export function OptInWelcomeModal() {
	const { user } = useAuth();
	const { recordTracksEvent } = useAnalytics();
	const { data: dashboardOptIn } = useSuspenseQuery(
		userPreferenceQuery( 'hosting-dashboard-opt-in' )
	);
	const { data: isDismissedPersisted } = useSuspenseQuery( userPreferenceQuery( preferenceName ) );
	const { mutate: updateDismissed, isPending: isDismissing } = useMutation(
		userPreferenceMutation( preferenceName )
	);

	const isOnOptInPreferences = !! useMatch( {
		from: hostingDashboardPreferencesRoute.id,
		shouldThrow: false,
	} );

	const isDismissed = isDismissedPersisted || isDismissing;

	const handleDismiss = () => {
		recordTracksEvent( 'calypso_dashboard_opt_in_welcome_modal_dismiss_click' );
		updateDismissed( new Date().toISOString() );
	};

	// Toggling opt-in from the preferences page would otherwise flip enrollment and pop the modal
	// open on top of that page, as if in response to the toggle.
	if ( isOnOptInPreferences ) {
		return null;
	}

	if ( ! isWelcomeModalEligible( dashboardOptIn, user.ID ) ) {
		return null;
	}

	if ( isDismissed ) {
		return null;
	}

	const title = __( 'Meet your new Hosting Dashboard' );

	return (
		<Guide
			className="dashboard-opt-in-welcome-modal"
			contentLabel={ title }
			onFinish={ handleDismiss }
			pages={ [
				{
					image: (
						<div className="dashboard-opt-in-welcome-modal__illustration" aria-hidden="true">
							<div
								className="dashboard-opt-in-welcome-modal__pattern"
								style={ { backgroundImage: `url(${ patternUrl })` } }
							/>
							<img
								className="dashboard-opt-in-welcome-modal__screenshot"
								src={ isRTL() ? illustrationRtlUrl : illustrationUrl }
								alt=""
							/>
						</div>
					),
					content: (
						<VStack className="dashboard-opt-in-welcome-modal__content" spacing={ 6 }>
							<ComponentViewTracker eventName="calypso_dashboard_opt_in_welcome_modal_impression" />
							<VStack spacing={ 3 }>
								<Text className="dashboard-opt-in-welcome-modal__title" as="h1">
									{ title }
								</Text>
								<Text>
									{ __(
										'It’s built to make everyday management tasks faster and easier across your sites, domains, plugins and account.'
									) }
								</Text>
								<ExternalLink
									href={ localizeUrl( 'https://wordpress.com/support/navigate-wordpress-com/' ) }
									onClick={ () => {
										recordTracksEvent(
											'calypso_dashboard_opt_in_welcome_modal_blog_post_link_click'
										);
									} }
								>
									{ __( 'Learn more' ) }
								</ExternalLink>
							</VStack>
							<HStack justify="end">
								<Button variant="primary" __next40pxDefaultSize onClick={ handleDismiss }>
									{ __( 'Explore your dashboard' ) }
								</Button>
							</HStack>
						</VStack>
					),
				},
			] }
		/>
	);
}
