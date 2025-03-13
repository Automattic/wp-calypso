import { Button } from '@wordpress/components';
import { chevronLeft } from '@wordpress/icons';
import { useStepContainerV2Context } from '../../../contexts/StepContainerV2Context';
import { decorateButtonWithTracksEventRecording } from '../../../helpers/decorateButtonWithTracksEventRecording';
import { normalizeButtonProps } from '../../../helpers/normalizeButtonProps';
import { ButtonProps } from '../../../types';

import './style.scss';

export const BackButton = ( originalProps: ButtonProps ) => {
	const stepContext = useStepContainerV2Context();

	const backButtonProps = normalizeButtonProps( originalProps, {
		label: 'Back',
		className: 'step-container-v2__back-button',
		icon: chevronLeft,
	} );

	return (
		<Button
			{ ...decorateButtonWithTracksEventRecording( backButtonProps, {
				tracksEventName: 'calypso_signup_previous_step_button_click',
				stepContext,
			} ) }
		/>
	);
};
