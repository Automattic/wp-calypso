import { useViewportMatch } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useDispatch } from 'react-redux';
import Button from 'calypso/components/forms/form-button';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';

interface Props {
	stepName: string;
	goToNextStep: () => void;
}

export default function SellStep( props: Props ): React.ReactNode {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const { stepName, goToNextStep } = props;
	const isMobile = useViewportMatch( 'small', '<' );

	const onAction = () => {
		dispatch( submitSignupStep( { stepName } ) );
		goToNextStep();
	};

	React.useEffect( () => {
		dispatch( saveSignupStep( { stepName } ) );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<StepWrapper
			className="sell-step"
			isFullLayout
			hideFormattedHeader
			stepContent={
				<div>
					This is the sell-step
					<Button onClick={ onAction }>Continue</Button>
				</div>
			}
			hideSkip={ isMobile }
			hideNext={ ! isMobile }
			skipLabelText={ translate( 'Skip this step' ) }
			skipButtonAlign="top"
			nextLabelText={ translate( 'Start selling' ) }
			{ ...props }
		/>
	);
}
