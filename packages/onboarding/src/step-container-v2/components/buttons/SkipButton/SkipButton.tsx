import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useStepContainerV2Context } from '../../../contexts/StepContainerV2Context';
import { decorateButtonWithTracksEventRecording } from '../../../helpers/decorateButtonWithTracksEventRecording';
import { normalizeButtonProps } from '../../../helpers/normalizeButtonProps';
import { ButtonProps } from '../../../types';

import './style.scss';

export const SkipButton = ( originalProps: ButtonProps ) => {
	const { __ } = useI18n();
	const stepContext = useStepContainerV2Context();

	const skipButtonProps = normalizeButtonProps( originalProps, {
		label: __( 'Skip', __i18n_text_domain__ ),
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
