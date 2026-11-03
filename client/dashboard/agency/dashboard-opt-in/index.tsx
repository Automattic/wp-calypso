import {
	a4aFeedbackSurveyMutation,
	activeAgencyQuery,
	agencyDashboardOptInMutation,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	Button,
	Modal,
	TextareaControl,
	ToggleControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { Notice } from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { Text } from '../../components/text';
import { a4aLink } from '../../utils/link';
import { isOnNewAgencyDashboard } from '../lib/dashboard-opt-in';
import { OWNER_ROLE } from '../team/constants';

/**
 * Agency > Dashboard: which dashboard the whole agency uses. Only the owner can change it,
 * and switching back asks first, since it moves everyone on the team.
 */
export default function AgencyDashboardOptIn() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { recordTracksEvent } = useAnalytics();
	const { data: agency } = useSuspenseQuery( activeAgencyQuery() );
	const { mutate, isPending } = useMutation( agencyDashboardOptInMutation( agency?.id ) );
	const [ isConfirmOpen, setIsConfirmOpen ] = useState( false );
	const [ reason, setReason ] = useState( '' );
	const { mutate: fileSurvey, isPending: isFilingSurvey } = useMutation(
		a4aFeedbackSurveyMutation()
	);

	const isSwitchingBack = isPending || isFilingSurvey;
	const isOwner = agency?.user?.role === OWNER_ROLE;
	const isOptedIn = isOnNewAgencyDashboard( agency );
	const previousDashboardUrl = a4aLink( '/overview' );

	const handleToggle = ( enabled: boolean ) => {
		recordTracksEvent( 'calypso_a4a_dashboard_opt_in_toggle_click', { enabled } );

		if ( ! enabled ) {
			setIsConfirmOpen( true );
			return;
		}

		mutate( 'opt-in', {
			onSuccess: () => {
				createSuccessNotice( __( 'New dashboard turned on.' ), { type: 'snackbar' } );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to turn on the new dashboard.' ), { type: 'snackbar' } );
			},
		} );
	};

	const handleCancelSwitchBack = () => {
		recordTracksEvent( 'calypso_a4a_dashboard_opt_out_cancel' );
		setIsConfirmOpen( false );
	};

	const goToPreviousDashboard = () => {
		window.location.href = previousDashboardUrl;
	};

	const handleSwitchBack = () => {
		const comment = reason.trim();
		recordTracksEvent( 'calypso_a4a_dashboard_opt_out_confirm', { has_reason: !! comment } );

		mutate( 'opt-out', {
			onSuccess: () => {
				if ( ! comment || ! agency ) {
					goToPreviousDashboard();
					return;
				}
				// Leave only once the reason is sent, or the navigation would cancel it.
				fileSurvey(
					{
						site_id: agency.id,
						survey_id: 'dashboard-switched-back',
						survey_responses: { comment: { text: comment }, suggestions: { text: '' } },
					},
					{ onSettled: goToPreviousDashboard }
				);
			},
			onError: () => {
				createErrorNotice( __( 'Failed to switch to the previous dashboard.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Dashboard' ) }
					description={ __( 'Choose which dashboard your agency uses.' ) }
				/>
			}
		>
			<VStack spacing={ 4 }>
				<Card>
					<CardBody>
						<VStack spacing={ 4 } alignment="flex-start">
							<SectionHeader
								title={ __( 'New dashboard' ) }
								description={ __(
									'The new dashboard brings your sites, purchases, and earnings together. Everyone on your team uses the dashboard you choose.'
								) }
								level={ 3 }
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								checked={ isOptedIn }
								label={ __( 'Use the new dashboard' ) }
								help={ isOwner ? undefined : __( 'Only the agency owner can change this.' ) }
								disabled={ ! isOwner || isPending }
								onChange={ handleToggle }
							/>
						</VStack>
					</CardBody>
				</Card>
				{ ! isOptedIn && (
					<Notice
						title={ __( 'Prefer the previous dashboard?' ) }
						variant="info"
						actions={
							<Button
								variant="primary"
								__next40pxDefaultSize
								href={ previousDashboardUrl }
								onClick={ () => recordTracksEvent( 'calypso_a4a_dashboard_opt_in_return_click' ) }
							>
								{ __( 'Go to the previous dashboard' ) }
							</Button>
						}
					>
						{ __(
							'Your team will use the previous dashboard until you turn the new one back on.'
						) }
					</Notice>
				) }
			</VStack>
			{ isConfirmOpen && (
				<Modal
					title={ __( 'Switch to the previous dashboard?' ) }
					size="medium"
					onRequestClose={ isSwitchingBack ? () => {} : handleCancelSwitchBack }
				>
					<VStack spacing={ 6 }>
						<Text>
							{ __(
								'Your whole team will use the previous dashboard. You can turn the new one back on here at any time.'
							) }
						</Text>
						<TextareaControl
							__nextHasNoMarginBottom
							label={ __( 'What made you switch back?' ) }
							placeholder={ __( 'Optional' ) }
							value={ reason }
							onChange={ setReason }
							rows={ 3 }
							disabled={ isSwitchingBack }
						/>
						<ButtonStack justify="flex-end">
							<Button
								__next40pxDefaultSize
								variant="tertiary"
								onClick={ handleCancelSwitchBack }
								disabled={ isSwitchingBack }
							>
								{ __( 'Cancel' ) }
							</Button>
							<Button
								__next40pxDefaultSize
								variant="primary"
								onClick={ handleSwitchBack }
								isBusy={ isSwitchingBack }
								disabled={ isSwitchingBack }
							>
								{ __( 'Switch to the previous dashboard' ) }
							</Button>
						</ButtonStack>
					</VStack>
				</Modal>
			) }
		</PageLayout>
	);
}
