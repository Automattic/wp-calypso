import { userPreferenceQuery, userPreferenceMutation } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalSpacer as Spacer,
	Button,
	ExternalLink,
	Icon,
	Modal,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { wordpress } from '@wordpress/icons';
import { useAnalytics } from '../../app/analytics';
import ComponentViewTracker from '../../components/component-view-tracker';
import illustrationUrl from './opt-in-welcome-modal-illustration.png';
import './opt-in-welcome-modal.scss';

const preferenceName = 'hosting-dashboard-opt-in-welcome-modal-dismissed' as const;

export default function OptInWelcomeModal() {
	const { recordTracksEvent } = useAnalytics();
	const isLargeViewport = useViewportMatch( 'small', '>=' );
	const { data: isDismissedPersisted } = useSuspenseQuery( userPreferenceQuery( preferenceName ) );
	const { mutate: updateDismissed, isPending: isDismissing } = useMutation(
		userPreferenceMutation( preferenceName )
	);

	const isDismissed = isDismissedPersisted || isDismissing;

	const handleDismiss = () => {
		recordTracksEvent( 'calypso_dashboard_opt_in_welcome_modal_dismiss_click' );
		updateDismissed( new Date().toISOString() );
	};

	if ( isDismissed ) {
		return null;
	}

	return (
		<Modal
			className="dashboard-opt-in-welcome-modal"
			shouldCloseOnEsc={ false }
			shouldCloseOnClickOutside={ false }
			isDismissible={ false }
			__experimentalHideHeader
			style={ {
				...( ! isLargeViewport && {
					height: 'fit-content',
					marginTop: 'auto',
				} ),
			} }
			onRequestClose={ handleDismiss }
		>
			<ComponentViewTracker eventName="calypso_dashboard_opt_in_welcome_modal_impression" />
			<HStack alignment="stretch" spacing={ 6 }>
				<VStack alignment="flex-start" spacing={ 4 } style={ { flex: 1 } }>
					<Icon icon={ wordpress } />
					<Text className="dashboard-opt-in-welcome-modal__title" as="h1">
						{ __( 'Meet the new WordPress.com Hosting Dashboard' ) }
					</Text>
					<Text variant="muted">
						{ __( 'A simpler way to manage your sites, domains, and hosting.' ) }
					</Text>
					<ExternalLink
						href="https://www.youtube.com/watch?v=fLzkYa1B9Rw"
						onClick={ () => {
							recordTracksEvent( 'calypso_dashboard_opt_in_welcome_modal_tutorial_link_click' );
						} }
					>
						{ __( 'Take a quick walkthrough' ) }
					</ExternalLink>
					<Spacer marginBottom={ 4 } />
					<Button variant="primary" style={ { marginTop: 'auto' } } onClick={ handleDismiss }>
						{ __( 'Try it out' ) }
					</Button>
				</VStack>
				{ isLargeViewport && (
					<VStack style={ { flex: 1 } }>
						<img
							src={ illustrationUrl }
							alt={ __( 'Meet the new WordPress.com Hosting Dashboard' ) }
						/>
					</VStack>
				) }
			</HStack>
		</Modal>
	);
}
