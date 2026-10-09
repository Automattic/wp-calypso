/**
 * PROTOTYPE — proof of concept only.
 *
 * Step orchestrator for the `/custom-signup` prototype:
 *   1. About you (the person signing up)
 *   2. About your agency
 *   3. Goals: what the agency needs help with
 * Finishing saves the answers to localStorage (see `lib/prototype-signup-data`)
 * and sends the user to the overview. Nothing is submitted to the API or
 * HubSpot, and no Tracks events fire, because demo data is fake.
 *
 * This entire flow is intended to replace the logged-out `/signup` flow in the
 * future. When that happens, wire submission back up via
 * `useCreateSignupMutation` / `useSubmitSignup` and restore Tracks events.
 */
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { A4A_OVERVIEW_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import StepProgress from './components/step-progress';
import ForAgenciesLogo from './for-agencies-logo';
import { getChallengeOptions } from './lib/options';
import {
	PrototypeSignupData,
	SAMPLE_PROTOTYPE_SIGNUP_DATA,
	savePrototypeSignupData,
} from './lib/prototype-signup-data';
import AboutAgencyStep from './steps/about-agency-step';
import AboutYouStep from './steps/about-you-step';
import ChoiceStep, { ChoiceStepAnswer } from './steps/choice-step';

// "About you" and "About your agency" are split into separate steps so each
// screen stays light (progressive disclosure).
const STEP_ABOUT_YOU = 1;
const STEP_ABOUT_AGENCY = 2;
const STEP_CHALLENGES = 3;

export default function CustomSignupForm() {
	const translate = useTranslate();
	const [ currentStep, setCurrentStep ] = useState( STEP_ABOUT_YOU );
	const [ data, setData ] = useState< PrototypeSignupData >( SAMPLE_PROTOTYPE_SIGNUP_DATA );

	const stepLabels = [
		translate( 'About you' ),
		translate( 'Your agency' ),
		translate( 'Your goals' ),
	];

	const goTo = ( patch: Partial< PrototypeSignupData >, step: number ) => {
		setData( ( prev ) => ( { ...prev, ...patch } ) );
		setCurrentStep( step );
	};

	const finish = ( { value: challenges, otherText: challengesOther }: ChoiceStepAnswer ) => {
		savePrototypeSignupData( { ...data, challenges, challengesOther } );
		// The overview is a separate app section, so do a full navigation.
		window.location.assign( A4A_OVERVIEW_LINK );
	};

	const renderStep = () => {
		switch ( currentStep ) {
			case STEP_ABOUT_YOU:
				return (
					<AboutYouStep
						initialData={ data }
						onContinue={ ( details ) => goTo( details, STEP_ABOUT_AGENCY ) }
					/>
				);
			case STEP_ABOUT_AGENCY:
				return (
					<AboutAgencyStep
						initialData={ data }
						onBack={ ( details ) => goTo( details, STEP_ABOUT_YOU ) }
						onContinue={ ( details ) => goTo( details, STEP_CHALLENGES ) }
					/>
				);
			case STEP_CHALLENGES:
				return (
					<ChoiceStep
						key="challenges"
						title={ translate( 'What can we help your agency with?' ) }
						description={ translate(
							'Select your goals in order of priority, and we’ll tailor your experience.'
						) }
						options={ getChallengeOptions() }
						initialValue={ data.challenges }
						initialOtherText={ data.challengesOther }
						otherPlaceholder={ translate( 'What else can we help your agency with?' ) }
						ctaLabel={ translate( 'Finish sign up' ) }
						footerNote={ translate(
							'Next, we’ll link your WordPress.com account to your agency dashboard. If you don’t have an account, you can create one on the next screen.'
						) }
						onBack={ ( { value, otherText } ) =>
							goTo( { challenges: value, challengesOther: otherText }, STEP_ABOUT_AGENCY )
						}
						ranked
						required
						onContinue={ finish }
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div className="a4a-custom-signup-form">
			<ForAgenciesLogo className="a4a-custom-signup-form-logo" />
			<StepProgress labels={ stepLabels } currentStep={ currentStep } />
			{ renderStep() }
		</div>
	);
}
