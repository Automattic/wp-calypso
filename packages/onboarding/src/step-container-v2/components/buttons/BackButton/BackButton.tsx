import { Button } from '@wordpress/components';
import { chevronLeft } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useStepContainerV2Context } from '../../../contexts/StepContainerV2Context';
import { decorateButtonWithTracksEventRecording } from '../../../helpers/decorateButtonWithTracksEventRecording';
import { normalizeButtonProps } from '../../../helpers/normalizeButtonProps';
import { ButtonProps } from '../../../types';

import './style.scss';

export const BackButton = ( {
	enableTracksEvent = true,
	...originalProps
}: ButtonProps & { enableTracksEvent?: boolean } ) => {
	const { __ } = useI18n();
	const stepContext = useStepContainerV2Context();

	const backButtonProps = normalizeButtonProps( originalProps, {
		children: __( 'Back', __i18n_text_domain__ ),
		className: 'step-container-v2__back-button',
		icon: chevronLeft,
	} );

	const buttonProps = enableTracksEvent
		? decorateButtonWithTracksEventRecording( backButtonProps, {
				tracksEventName: 'calypso_signup_previous_step_button_click',
				stepContext,
		  } )
		: backButtonProps;

	return <Button { ...buttonProps } />;
};
