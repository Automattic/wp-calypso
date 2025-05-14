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
import SubmitSignupConfirmation from './submit-signup-confirmation';

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

const personalizationStepProgress: PersonalizationStepProgress = {
	3: 50,
	4: 75,
	5: 100,
	6: 100,
};

const getPersonalizationProgress = ( currentStep: number, submitAsSurvey: boolean ): number => {
	if ( submitAsSurvey ) {
		return personalizationStepProgress[ currentStep ] ?? 0;
	}

	return currentStep === 2 ? 50 : 0;
};

const getSignupProgress = ( step: number ): number => {
	return step === 1 ? 50 : 100;
};

const getFinishSurveyProgress = ( step: number ): number => {
	return step === 6 ? 100 : 0;
};

const getSubmitSignupConfirmationProgress = ( step: number ): number => {
	return step === 6 ? 50 : 0;
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
			value: getPersonalizationProgress( currentStep, submitAsSurvey ),
		},
		{
			label: submitAsSurvey ? translate( 'Finish survey' ) : translate( 'Complete setup' ),
			isActive: currentStep > 5,
			value: submitAsSurvey
				? getFinishSurveyProgress( currentStep )
				: getSubmitSignupConfirmationProgress( currentStep ),
		},
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
				6: submitAsSurvey ? 'finish_signup_survey' : 'submit_signup_confirmation',
			};

			dispatch(
				recordTracksEvent( 'calypso_a4a_agency_signup_form_view', {
					step: viewMap[ step as keyof typeof viewMap ],
				} )
			);
		},
		[ dispatch, submitAsSurvey ]
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

	const onCreateAgency = useCallback( () => {
		submitSignup( formData as AgencyDetailsSignupPayload );
	}, [ formData, submitSignup ] );

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
							updateDataAndContinue( data, withPersonalizedBlueprint ? 3 : 6 )
						}
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
				return submitAsSurvey ? (
					<FinishSignupSurvey
						onContinue={ clearDataAndRefresh }
						blueprintRequested={ blueprintRequested }
					/>
				) : (
					<SubmitSignupConfirmation onContinue={ onCreateAgency } />
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
