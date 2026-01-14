import { userPreferenceQuery, userPreferenceMutation } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	FormToggle,
	Button,
	Modal,
	ExternalLink,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useId, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useAnalytics } from '../../app/analytics';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import FlashMessage from '../../components/flash-message';
import { wpcomLink } from '../../utils/link';

export default function PreferencesOptInForm() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { recordTracksEvent } = useAnalytics();
	const toggleId = useId();

	const { data: optIn } = useSuspenseQuery( userPreferenceQuery( 'hosting-dashboard-opt-in' ) );
	const { mutate: saveOptInPreference, isPending } = useMutation(
		userPreferenceMutation( 'hosting-dashboard-opt-in' )
	);

	const isEnabled = optIn.value === 'opt-in';
	const [ showConfirmModal, setShowConfirmModal ] = useState( false );

	const handleToggle = () => {
		const newValue = ! isEnabled;

		recordTracksEvent( 'calypso_dashboard_me_preferences_new_hosting_dashboard_toggle_click', {
			enabled: newValue,
		} );

		if ( ! newValue ) {
			// Show confirmation modal when disabling
			setShowConfirmModal( true );
		} else {
			// Enable directly
			saveOptInPreference(
				{
					value: 'opt-in',
					updated_at: new Date().toISOString(),
				},
				{
					onSuccess() {
						createSuccessNotice( __( 'New Hosting Dashboard enabled.' ), { type: 'snackbar' } );
					},
					onError() {
						createErrorNotice( __( 'Failed to enable new Hosting Dashboard.' ), {
							type: 'snackbar',
						} );
					},
				}
			);
		}
	};

	const handleConfirmOptOut = () => {
		recordTracksEvent( 'calypso_dashboard_me_preferences_new_hosting_dashboard_opt_out_confirm' );

		saveOptInPreference(
			{
				value: 'opt-out',
				updated_at: new Date().toISOString(),
			},
			{
				onSuccess() {
					createSuccessNotice( __( 'New Hosting Dashboard disabled.' ), { type: 'snackbar' } );
					window.location.href = wpcomLink( '/me/account' );
				},
				onError() {
					createErrorNotice( __( 'Failed to disable new Hosting Dashboard.' ), {
						type: 'snackbar',
					} );
					setShowConfirmModal( false );
				},
			}
		);
	};

	const handleCloseModal = () => {
		setShowConfirmModal( false );
	};

	return (
		<>
			<FlashMessage id="dashboard" message={ __( 'New Hosting Dashboard enabled.' ) } />
			<Card>
				<CardBody>
					<VStack spacing={ 2 }>
						<HStack alignment="top" justify="space-between">
							<Text as="label" htmlFor={ toggleId } size="15px" weight={ 500 } lineHeight="20px">
								{ __( 'Try the new Hosting Dashboard' ) }
							</Text>
							<FormToggle
								id={ toggleId }
								checked={ isEnabled }
								onChange={ handleToggle }
								disabled={ isPending }
							/>
						</HStack>
						<Text variant="muted" lineHeight="20px">
							{ __(
								"We've recently updated the dashboard with a modern design and smarter tools for managing your hosting."
							) }
						</Text>
					</VStack>
				</CardBody>
			</Card>

			{ showConfirmModal && (
				<Modal
					title={ __( 'Disable the new dashboard?' ) }
					onRequestClose={ handleCloseModal }
					size="small"
				>
					<VStack spacing={ 6 }>
						<Text>
							{ __(
								"We're actively working to make the new dashboard better. If something isn't working for you or you have ideas for improvement, we'd really appreciate hearing about it."
							) }
						</Text>
						<Text>
							{ __(
								'Your feedback helps us understand what matters most and build a better experience for everyone.'
							) }
						</Text>
						<ExternalLink
							href="https://automattic.survey.fm/msd-survey-for-opt-out"
							onClick={ () =>
								recordTracksEvent(
									'calypso_dashboard_me_preferences_new_hosting_dashboard_survey_click'
								)
							}
						>
							{ __( 'Take a quick survey' ) }
						</ExternalLink>
						<ButtonStack justify="flex-end">
							<Button __next40pxDefaultSize variant="tertiary" onClick={ handleCloseModal }>
								{ __( 'Keep using new dashboard' ) }
							</Button>
							<Button
								__next40pxDefaultSize
								variant="primary"
								onClick={ handleConfirmOptOut }
								isBusy={ isPending }
								disabled={ isPending }
							>
								{ __( 'Disable' ) }
							</Button>
						</ButtonStack>
					</VStack>
				</Modal>
			) }
		</>
	);
}
