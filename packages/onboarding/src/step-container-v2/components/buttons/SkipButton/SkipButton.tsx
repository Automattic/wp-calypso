import { useI18n } from '@wordpress/react-i18n';
import { useStepContainerV2Context } from '../../../contexts/StepContainerV2Context';
import { decorateButtonWithTracksEventRecording } from '../../../helpers/decorateButtonWithTracksEventRecording';
import { normalizeButtonProps } from '../../../helpers/normalizeButtonProps';
import { ButtonProps } from '../../../types';
import { LinkButton } from '../LinkButton/LinkButton';
import { SecondaryButton } from '../SecondaryButton/SecondaryButton';

import './style.scss';

type SkipButtonProps = ButtonProps & {
	/**
	 * The visual style of the button. Defaults to a text link, matching
	 * {@link LinkButton}. Use `'secondary'` to render a neutral-bordered
	 * {@link SecondaryButton} (layout, e.g. width, is left to the consumer).
	 * @default 'link'
	 */
	appearance?: 'link' | 'secondary';
};

/**
 * Do NOT use this button if you don't intend to skip the step.
 *
 * Fires the `calypso_signup_skip_step` Tracks event when clicked — this is the
 * difference from the plain {@link LinkButton}/{@link SecondaryButton}. The
 * `appearance` prop selects the visual style without changing that behavior.
 */
export const SkipButton = ( { appearance = 'link', ...originalProps }: SkipButtonProps ) => {
	const { __ } = useI18n();
	const stepContext = useStepContainerV2Context();

	const skipButtonProps = decorateButtonWithTracksEventRecording(
		normalizeButtonProps( originalProps, {
			children: __( 'Skip', __i18n_text_domain__ ),
			className: 'step-container-v2__skip-button',
		} ),
		{
			tracksEventName: 'calypso_signup_skip_step',
			stepContext,
		}
	);

	const Button = appearance === 'secondary' ? SecondaryButton : LinkButton;

	return <Button { ...skipButtonProps } />;
};
