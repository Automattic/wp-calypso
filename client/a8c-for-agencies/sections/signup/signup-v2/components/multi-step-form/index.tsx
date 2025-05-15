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
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import useCreateSignupMutation from '../../../hooks/use-create-signup-mutation';
import StepProgress from '../step-progress';
import BlueprintForm from './blueprint-form';
import BlueprintForm2 from './blueprint-form-2';
import ChoiceBlueprint from './choice-blueprint';
import SignupContactForm from './contact-form';
import FinishSignupSurvey from './finish-signup-survey';
import useSubmitSignup from './hooks/use-submit-signup';
import PersonalizationForm from './personalization';

import './style.scss';

type Props = {
	withPersonalizedBlueprint?: boolean;
	submitAsSurvey?: boolean;
};

type PersonalizationStepProgress = {
	[ key: number ]: number;
};

type Step = {
	label: string;
	isActive: boolean;
	value: number;
};

const STEP_NOT_STARTED = 0;
const STEP_HALFWAY = 50;
const STEP_COMPLETED = 100;

const personalizationStepProgress: PersonalizationStepProgress = {
	3: 50,
	4: 75,
	5: 100,
	6: 100,
};

const getPersonalizationProgress = (
	currentStep: number,
	withPersonalizedBlueprint: boolean
): number => {
	if ( withPersonalizedBlueprint ) {
		// if this includes blueprint, it means we have more steps to go.
		return personalizationStepProgress[ currentStep ] ?? STEP_NOT_STARTED;
	}

	if ( currentStep > 2 ) {
		// If we are past Step 2, it means we have completed the Personalization screen.
		return STEP_COMPLETED;
	}

	// If we are in Step 2, it means we are halfway through the process otherwise personalization is not started
	return currentStep === 2 ? STEP_HALFWAY : STEP_NOT_STARTED;
};

const getSignupProgress = ( step: number ): number => {
	return step === 1 ? STEP_HALFWAY : STEP_COMPLETED;
};

const getFinishSurveyProgress = ( step: number ): number => {
	return step === 6 ? STEP_COMPLETED : STEP_NOT_STARTED;
};

const MultiStepForm = ( { withPersonalizedBlueprint = false, submitAsSurvey = false }: Props ) => {
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
			value: getPersonalizationProgress( currentStep, withPersonalizedBlueprint ),
		},
		...( submitAsSurvey
			? [
					{
						label: translate( 'Finish survey' ),
						isActive: currentStep > 5,
						value: getFinishSurveyProgress( currentStep ),
					},
			  ]
			: [] ),
	];

	const { mutate: submitSurvey } = useCreateSignupMutation( {
		onSuccess: () => {
			dispatch( successNotice( 'Signup successful', { id: notificationId } ) );
		},
		onError: ( error: APIError ) => {
			dispatch( errorNotice( error?.message, { id: notificationId } ) );
		},
	} );

	const submitSignup = useSubmitSignup();

	const trackView = useCallback(
		( step: number ) => {
			const viewMap = {
				1: 'signup_contact_form',
				2: 'personalization_form',
				3: 'choice_blueprint',
				4: 'blueprint_form',
				5: 'blueprint_form_2',
				6: 'finish_signup_survey',
			};

			dispatch(
				recordTracksEvent( 'calypso_a4a_agency_signup_form_view', {
					step: viewMap[ step as keyof typeof viewMap ],
				} )
			);
		},
		[ dispatch ]
	);

	const updateDataAndContinue = useCallback(
		(
			data: Partial< AgencyDetailsSignupPayload >,
			nextStep: number,
			isBlueprintRequested = false
		) => {
			const newFormData = { ...formData, ...data };
			setFormData( newFormData );
			setCurrentStep( nextStep );
			if ( nextStep === 6 && submitAsSurvey ) {
				const {
					topPartneringGoal,
					topYearlyGoal,
					workWithClients,
					workWithClientsOther,
					approachAndChallenges,
					...rest
				} = newFormData;
				const payload = isBlueprintRequested ? newFormData : rest;
				submitSurvey( payload as AgencyDetailsSignupPayload );
			}
		},
		[ formData, submitAsSurvey, submitSurvey ]
	);

	const clearDataAndRefresh = () => {
		setFormData( {} );
		setBlueprintRequested( false );
		window.location.reload();
	};

	const onCreateAgency = useCallback(
		( data: Partial< AgencyDetailsSignupPayload > ) => {
			const newFormData = { ...formData, ...data };
			submitSignup( newFormData as AgencyDetailsSignupPayload );
		},
		[ formData, submitSignup ]
	);

	const currentForm = useMemo( () => {
		trackView( currentStep );
		switch ( currentStep ) {
			case 1:
				return (
					<SignupContactForm
						onContinue={ ( data ) => updateDataAndContinue( data, 2 ) }
						initialFormData={ formData }
						withEmail={ submitAsSurvey }
					/>
				);
			case 2:
				return (
					<PersonalizationForm
						onContinue={ ( data ) =>
							// If the multi-form does not include blueprint, we can skip to the last step (6).
							updateDataAndContinue( data, withPersonalizedBlueprint ? 3 : 6 )
						}
						onSubmit={ ( data ) => onCreateAgency( data ) }
						isFinalStep={ ! submitAsSurvey }
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
	}, [
		blueprintRequested,
		currentStep,
		formData,
		onCreateAgency,
		submitAsSurvey,
		trackView,
		updateDataAndContinue,
		withPersonalizedBlueprint,
	] );

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
