import { APIError } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import A4ALogo, {
	LOGO_COLOR_SECONDARY_ALT,
	LOGO_COLOR_SECONDARY,
} from 'calypso/a8c-for-agencies/components/a4a-logo';
import { useIsDarkMode } from 'calypso/a8c-for-agencies/hooks/use-is-dark-mode';
import { AgencyDetailsSignupPayload } from 'calypso/a8c-for-agencies/sections/signup/types';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import useCreateSignupMutation from '../../../hooks/use-create-signup-mutation';
import StepProgress from '../step-progress';
import BlueprintForm from './blueprint-form';
import BlueprintForm2 from './blueprint-form-2';
import ChoiceBlueprint from './choice-blueprint';
import SignupContactForm from './contact-form';
import FinishSignupSurvey from './finish-signup-survey';
import PersonalizationForm from './personalization';

import './style.scss';

type PersonalizationStepProgress = {
	[ key: number ]: number;
};

type Step = {
	label: string;
	isActive: boolean;
	value: number;
};

const personalizationStepProgress: PersonalizationStepProgress = {
	3: 50,
	4: 75,
	5: 100,
	6: 100,
};

const getPersonalizationProgress = ( currentStep: number ): number => {
	return personalizationStepProgress[ currentStep ] ?? 0;
};

const getSignupProgress = ( step: number ): number => {
	return step === 1 ? 50 : 100;
};

const getFinishSurveyProgress = ( step: number ): number => {
	return step === 6 ? 100 : 0;
};

const MultiStepForm = () => {
	const notificationId = 'a4a-agency-signup-form';
	const translate = useTranslate();
	const [ currentStep, setCurrentStep ] = useState( 1 );
	const dispatch = useDispatch();
	const isDarkMode = useIsDarkMode();

	const [ formData, setFormData ] = useState< Partial< AgencyDetailsSignupPayload > >( {} );
	const [ blueprintRequested, setBlueprintRequested ] = useState( false );

	const steps: Step[] = [
		{
			label: translate( 'Sign up' ),
			isActive: currentStep > 0,
			value: getSignupProgress( currentStep ),
		},
		{
			label: translate( 'Personalize' ),
			isActive: currentStep > 3,
			value: getPersonalizationProgress( currentStep ),
		},
		{
			label: translate( 'Finish survey' ),
			isActive: currentStep > 5,
			value: getFinishSurveyProgress( currentStep ),
		},
	];

	const createSignup = useCreateSignupMutation( {
		onSuccess: () => {
			dispatch( successNotice( 'Signup successful', { id: notificationId } ) );
		},
		onError: ( error: APIError ) => {
			dispatch( errorNotice( error?.message, { id: notificationId } ) );
		},
	} );

	const updateDataAndContinue = useCallback(
		(
			data: Partial< AgencyDetailsSignupPayload >,
			nextStep: number,
			isBlueprintRequested = false
		) => {
			const newFormData = { ...formData, ...data };
			setFormData( newFormData );
			setCurrentStep( nextStep );
			if ( nextStep === 6 ) {
				const {
					topPartneringGoal,
					topYearlyGoal,
					workWithClients,
					workWithClientsOther,
					approachAndChallenges,
					...rest
				} = newFormData;
				const payload = isBlueprintRequested ? newFormData : rest;
				createSignup.mutate( payload as AgencyDetailsSignupPayload );
			}
		},
		[ formData, createSignup ]
	);

	const clearDataAndRefresh = () => {
		setFormData( {} );
		setBlueprintRequested( false );
		window.location.reload();
	};

	const currentForm = useMemo( () => {
		switch ( currentStep ) {
			case 1:
				return (
					<SignupContactForm
						onContinue={ ( data ) => updateDataAndContinue( data, 2 ) }
						initialFormData={ formData }
					/>
				);
			case 2:
				return (
					<PersonalizationForm
						onContinue={ ( data ) => updateDataAndContinue( data, 3 ) }
						initialFormData={ formData }
						goBack={ () => setCurrentStep( 1 ) }
					/>
				);
			case 3:
				return (
					<ChoiceBlueprint
						onContinue={ () => updateDataAndContinue( {}, 4 ) }
						onSkip={ () => updateDataAndContinue( {}, 6 ) }
						goBack={ () => setCurrentStep( 2 ) }
					/>
				);
			case 4:
				return (
					<BlueprintForm
						onContinue={ ( data ) => updateDataAndContinue( data, 5 ) }
						initialFormData={ formData }
						goBack={ () => setCurrentStep( 3 ) }
					/>
				);
			case 5:
				return (
					<BlueprintForm2
						onContinue={ ( data ) => {
							setBlueprintRequested( true );
							updateDataAndContinue( data, 6, true );
						} }
						initialFormData={ formData }
						goBack={ () => setCurrentStep( 4 ) }
					/>
				);
			case 6:
				return (
					<FinishSignupSurvey
						onContinue={ clearDataAndRefresh }
						blueprintRequested={ blueprintRequested }
					/>
				);
			default:
				return null;
		}
	}, [ blueprintRequested, currentStep, formData, updateDataAndContinue ] );

	return (
		<div className="signup-multi-step-form">
			<A4ALogo
				fullA4AV2
				colors={ { secondary: isDarkMode ? LOGO_COLOR_SECONDARY_ALT : LOGO_COLOR_SECONDARY } }
				className="multi-step-form__logo-narrow"
			/>
			<StepProgress steps={ steps } />

			{ currentForm }
		</div>
	);
};

export default MultiStepForm;
