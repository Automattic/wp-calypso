import { userPreferenceQuery, userPreferenceMutation } from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	ExternalLink,
	Guide,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ComponentViewTracker from '../../components/component-view-tracker';
import { getHostingDashboardEnrollment } from '../../utils/hosting-dashboard-enrollment';
import { useAnalytics } from '../analytics';
import { useAuth } from '../auth';
import patternUrl from './welcome-modal-background-pattern.png';
import './style.scss';

const preferenceName = 'hosting-dashboard-opt-in-welcome-modal-dismissed' as const;

// TODO(DES-547): set the published post URL before enabling the dashboard/opt-in-welcome-modal flag.
const BLOG_POST_URL = 'https://wordpress.com/blog/';

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

	const isDismissed = isDismissedPersisted || isDismissing;

	const handleStartNow = () => {
		recordTracksEvent( 'calypso_dashboard_opt_in_welcome_modal_dismiss_click' );
		updateDismissed( new Date().toISOString() );
	};

	// Only users whose default experience is the dashboard should see the welcome pitch.
	const dashboardEnrollment = getHostingDashboardEnrollment( dashboardOptIn, user.ID );
	if ( ! dashboardEnrollment.enrolled ) {
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
			onFinish={ handleStartNow }
			finishButtonText={ __( 'Explore your dashboard' ) }
			pages={ [
				{
					image: (
						<div className="dashboard-opt-in-welcome-modal__illustration">
							<div
								className="dashboard-opt-in-welcome-modal__pattern"
								style={ { backgroundImage: `url(${ patternUrl })` } }
							/>
						</div>
					),
					content: (
						<VStack className="dashboard-opt-in-welcome-modal__content" spacing={ 4 }>
							<ComponentViewTracker eventName="calypso_dashboard_opt_in_welcome_modal_impression" />
							<Text className="dashboard-opt-in-welcome-modal__title" as="h1">
								{ title }
							</Text>
							<Text>
								{ __(
									'It’s built to make everyday management tasks faster and easier across your sites, domains, plugins and account.'
								) }
							</Text>
							<ExternalLink
								href={ localizeUrl( BLOG_POST_URL ) }
								onClick={ () => {
									recordTracksEvent(
										'calypso_dashboard_opt_in_welcome_modal_blog_post_link_click'
									);
								} }
							>
								{ __( 'Read the blog post' ) }
							</ExternalLink>
						</VStack>
					),
				},
			] }
		/>
	);
}
