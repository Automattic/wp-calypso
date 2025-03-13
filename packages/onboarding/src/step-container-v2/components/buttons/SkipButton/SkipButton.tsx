import { Button } from '@wordpress/components';
import { useStepContainerV2Context } from '../../../contexts/StepContainerV2Context';
import { decorateButtonWithTracksEventRecording } from '../../../helpers/decorateButtonWithTracksEventRecording';
import { normalizeButtonProps } from '../../../helpers/normalizeButtonProps';
import { ButtonProps } from '../../../types';

import './style.scss';

export const SkipButton = ( originalProps: ButtonProps ) => {
	const stepContext = useStepContainerV2Context();

	const skipButtonProps = normalizeButtonProps( originalProps, {
		label: 'Skip',
		className: 'step-container-v2__skip-button',
	} );

	return (
		<Button
			variant="link"
			{ ...decorateButtonWithTracksEventRecording( skipButtonProps, {
				tracksEventName: 'calypso_signup_skip_step',
				stepContext,
			} ) }
		/>
	);
};
