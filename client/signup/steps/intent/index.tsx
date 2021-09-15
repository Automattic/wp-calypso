import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import StepWrapper from 'calypso/signup/step-wrapper';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';

type IntentFlag = 'build' | 'write';

interface Props {
	goToNextStep: () => void;
	isReskinned: boolean;
	signupDependencies: any;
	stepName: string;
}

export default function IntentStep( props: Props ): React.ReactNode {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const { goToNextStep, isReskinned, stepName } = props;

	const headerText = translate( 'header' );
	const subHeaderText = translate( 'subheader' );

	const submitIntent = ( intent: IntentFlag ) => {
		recordTracksEvent( 'calypso_signup_select_intent', { intent } );

		dispatch( submitSignupStep( { stepName }, { intent } ) );

		if ( intent === 'write' ) {
			dispatch(
				submitSignupStep(
					{ stepName: 'design-setup-site' },
					{
						selectedDesign: {
							theme: 'independent-publisher-2',
							slug: 'independent-publisher-2',
						},
					}
				)
			);
		}

		goToNextStep();
	};

	const content = (
		<div>
			<div>
				<Button onClick={ () => submitIntent( 'write' ) }>{ translate( 'Write' ) }</Button>
			</div>
			<div>
				<Button onClick={ () => submitIntent( 'build' ) }>{ translate( 'Build' ) }</Button>
			</div>
		</div>
	);

	return (
		<StepWrapper
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			stepContent={ content }
			align={ isReskinned ? 'left' : 'center' }
			skipButtonAlign={ isReskinned ? 'top-right' : 'bottom' }
			{ ...props }
		/>
	);
}
