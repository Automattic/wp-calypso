import { useI18n } from '@wordpress/react-i18n';
import { useStepContainerV2Context } from '../../../contexts/StepContainerV2Context';
import { decorateButtonWithTracksEventRecording } from '../../../helpers/decorateButtonWithTracksEventRecording';
import { normalizeButtonProps } from '../../../helpers/normalizeButtonProps';
import { ButtonProps } from '../../../types';
import { LinkButton } from '../LinkButton/LinkButton';

/**
 * Do NOT use this button if you don't intend to skip the step.
 *
 * This button is visually identical to {@link LinkButton}.
 * The difference between them is that this one fires a Tracks event when clicked.
 */
export const SkipButton = ( originalProps: ButtonProps ) => {
	const { __ } = useI18n();
	const stepContext = useStepContainerV2Context();

	const skipButtonProps = normalizeButtonProps( originalProps, {
		label: __( 'Skip', __i18n_text_domain__ ),
	} );

	return (
		<LinkButton
			{ ...decorateButtonWithTracksEventRecording( skipButtonProps, {
				tracksEventName: 'calypso_signup_skip_step',
				stepContext,
			} ) }
		/>
	);
};
