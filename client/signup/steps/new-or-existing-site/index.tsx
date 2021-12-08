import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep } from 'calypso/state/signup/progress/actions';
import NewOrExistingSiteScreen from './new-or-existing-site';
import { ChoiceType } from './types';

interface Props {
	goToNextStep: () => void;
	submitSignupStep: ( { stepName, wasSkipped }: { stepName: string; wasSkipped: boolean } ) => void;
	goToStep: ( stepName: string ) => void;
	stepName: string;
}

export default function NewOrExistingSiteStep( props: Props ): React.ReactNode {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const headerText = translate( 'Choose where you want us to build your site.' );
	const subHeaderText = '';

	useEffect( () => {
		dispatch( saveSignupStep( { stepName: props.stepName } ) );
	}, [ dispatch, props.stepName ] );

	const newOrExistingSiteSelected = ( value: ChoiceType ) => {
		props.submitSignupStep( { stepName: props.stepName } );
		if ( 'existing-site' === value ) {
			props.goToNextStep();
		} else {
			props.submitSignupStep( { stepName: 'difm-site-picker', wasSkipped: true } );
			props.goToStep( 'difm-design-setup-site' );
		}
	};

	return (
		<StepWrapper
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			// headerImageUrl={ intentImageUrl }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			stepContent={ <NewOrExistingSiteScreen onSelect={ newOrExistingSiteSelected } /> }
			align={ 'left' }
			hideSkip
			// isHorizontalLayout={ true }
			{ ...props }
		/>
	);
}
