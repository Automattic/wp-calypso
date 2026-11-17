import { a4aFeedbackSurveyMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Button, TextareaControl, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';

/**
 * Asks for feedback while the agency is on the new dashboard. It's filed through the same
 * A4A feedback survey as the reason for switching back, under its own survey ID.
 */
export default function DashboardFeedbackCard( { agencyId }: { agencyId: number } ) {
	const { recordTracksEvent } = useAnalytics();
	const [ feedback, setFeedback ] = useState( '' );
	const { mutate: fileSurvey, isPending } = useMutation(
		withSnackbar( a4aFeedbackSurveyMutation(), {
			success: __( 'Thanks! Your feedback is on its way to our team.' ),
			error: __( 'Failed to send your feedback. Please try again.' ),
		} )
	);

	const comment = feedback.trim();

	const handleSubmit = () => {
		if ( ! comment ) {
			return;
		}
		recordTracksEvent( 'calypso_a4a_dashboard_feedback_submit' );
		fileSurvey(
			{
				site_id: agencyId,
				survey_id: 'dashboard-feedback',
				survey_responses: { comment: { text: comment }, suggestions: { text: '' } },
			},
			{ onSuccess: () => setFeedback( '' ) }
		);
	};

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 } alignment="stretch">
					<SectionHeader
						title={ __( 'Give feedback on the new dashboard' ) }
						description={ __(
							'We’re all ears, and we’re shaping the new dashboard around how your agency works. Tell us what you like, what needs work, and any bugs you’ve found.'
						) }
						level={ 3 }
					/>
					<TextareaControl
						__nextHasNoMarginBottom
						label={ __( 'Your feedback' ) }
						hideLabelFromVision
						placeholder={ __( 'What’s working, what isn’t, and anything that broke' ) }
						value={ feedback }
						onChange={ setFeedback }
						rows={ 4 }
						disabled={ isPending }
					/>
					<ButtonStack justify="flex-start">
						<Button
							__next40pxDefaultSize
							variant="primary"
							onClick={ handleSubmit }
							isBusy={ isPending }
							disabled={ isPending || ! comment }
						>
							{ __( 'Send feedback' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
