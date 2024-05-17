import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useDesktopBreakpoint, useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import CardHeading from 'calypso/components/card-heading';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useExperiment } from 'calypso/lib/explat';
import StepWrapper from 'calypso/signup/step-wrapper';
import {
	ButtonContainer,
	CardContent,
	OptionsContainer,
	StyledCard,
	StyledFormTextInput,
	StyledLabel,
	SurveyFormContainer,
	Viewport,
} from './components';
import Shuffle, { getCheckBoxKey } from './components/Shuffle';

const defaultFormState = {
	survey_goals_blogging: null,
	survey_goals_website_building: null,
	/**
	 * This option is not in use currently
	 */
	survey_goals_wordpress_hosting: null,
	survey_goals_website_hosting: null,
	survey_goals_migration: null,
	survey_goals_custom_check: null,
	survey_goals_custom_text: '',
	survey_describe_yourself_creator: null,
	survey_describe_yourself_business: null,
	survey_describe_yourself_ecommerce: null,
	survey_describe_yourself_enterprise: null,
	survey_describe_yourself_developer: null,
	survey_describe_yourself_agency: null,
	survey_describe_yourself_custom_check: null,
	survey_describe_yourself_custom_text: '',
};
type FormState = Record< keyof typeof defaultFormState, null | undefined | string | boolean >;

type SubmitSignupStepType = (
	step: { stepName: string; wasSkipped?: boolean },
	providedDependencies?: object,
	optionalProps?: any
) => void;
interface Props {
	goToNextStep: () => void;
	submitSignupStep: SubmitSignupStepType;
	goToStep: ( stepName: string ) => void;
	flowName: string;
	stepName: string;
}

function ControlledCheckbox( props: {
	name: string;
	value: string | boolean | null | undefined;
	onChange: ( e: ChangeEvent< HTMLInputElement > ) => void;
} ) {
	const inputRef = useRef< HTMLInputElement >( null );

	useEffect( () => {
		if ( inputRef.current ) {
			if ( props.value ) {
				inputRef.current.checked = true;
			} else {
				inputRef.current.checked = false;
			}
		}
	}, [ props.value ] );

	return <FormInputCheckbox onChange={ props.onChange } name={ props.name } ref={ inputRef } />;
}

function SurveyForm( props: Props ) {
	const [ isExperimentLoading, experimentAssignment ] = useExperiment(
		'calypso_signup_onboarding_site_goals_survey_i2'
	);
	const variantName = experimentAssignment?.variationName;
	const isScrambled =
		variantName === 'treatment_scrambled' ||
		config.isEnabled( 'onboarding/new-user-survey-scrambled' );

	const [ formState, setFormState ] = useState< FormState >( defaultFormState );
	const [ orderGoals, setOrderGoals ] = useState< string[] | null >( [] );
	const [ orderDescribeYourself, setOrderDescribeYourself ] = useState< string[] | null >( [] );
	const translate = useTranslate();
	const isMobileViewport = useMobileBreakpoint();
	const isDesktopViewport = useDesktopBreakpoint();

	useEffect( () => {
		if ( isExperimentLoading ) {
			return;
		}
		recordTracksEvent( 'calypso_signup_new_user_survey_view' );
	}, [ isExperimentLoading ] );

	if ( isExperimentLoading ) {
		return null;
	}

	const handleChange = ( e: ChangeEvent< HTMLInputElement > ) => {
		const { name, value } = e.target as { name: keyof FormState; value: string | 'on' };
		if ( name.includes( 'custom_text' ) ) {
			let updatedData: Partial< FormState > = { [ name ]: value };
			if ( name.includes( 'goals' ) ) {
				updatedData = { ...updatedData, survey_goals_custom_check: !! value };
			} else {
				updatedData = { ...updatedData, survey_describe_yourself_custom_check: !! value };
			}
			setFormState( ( prev: FormState ) => ( {
				...prev,
				...updatedData,
			} ) );
		} else if ( name.includes( 'custom_check' ) ) {
			const newCheckedValue = ! formState[ name ];
			let updatedData: Partial< FormState > = { [ name ]: newCheckedValue };
			if ( name.includes( 'goals' ) ) {
				updatedData = {
					...updatedData,
					survey_goals_custom_text: newCheckedValue ? formState.survey_goals_custom_text : '',
				};
			} else {
				updatedData = {
					...updatedData,
					survey_describe_yourself_custom_text: newCheckedValue
						? formState.survey_describe_yourself_custom_text
						: '',
				};
			}
			setFormState( ( prev: FormState ) => ( {
				...prev,
				...updatedData,
			} ) );
		} else {
			setFormState( ( prev: FormState ) => ( {
				...prev,
				[ name ]: ! prev[ name ],
			} ) );
		}
	};

	const handleContinue = () => {
		const { stepName, goToNextStep, submitSignupStep } = props;
		submitSignupStep(
			{ stepName },
			{},
			{
				...formState,
				survey_field_order_goals: orderGoals?.join( ', ' ),
				survey_field_order_describe_yourself: orderDescribeYourself?.join( ', ' ),
				survey_experiment_variant_name: variantName,
			}
		);
		goToNextStep();
	};

	let currentViewport: Viewport = 'tablet';
	if ( isMobileViewport ) {
		currentViewport = 'mobile';
	} else if ( isDesktopViewport ) {
		currentViewport = 'desktop';
	}

	const placeholder = translate( 'Something else?' );
	return (
		<SurveyFormContainer currentViewport={ currentViewport }>
			<StyledCard currentViewport={ currentViewport }>
				<CardContent>
					<FormFieldset>
						<CardHeading tagName="h5" isBold size={ 18 }>
							{ currentViewport === 'mobile'
								? translate( 'What are your top goals?' )
								: translate(
										'What are your top goals? {{s}}(You can check multiple boxes.){{/s}}',
										{
											components: {
												s: <small />,
											},
										}
								  ) }
						</CardHeading>
						<OptionsContainer>
							<Shuffle
								isShuffleActive={ isScrambled }
								getChildKey={ getCheckBoxKey }
								childOrder={ orderGoals }
								setChildOrder={ setOrderGoals }
							>
								<StyledLabel>
									<FormInputCheckbox name="survey_goals_blogging" onChange={ handleChange } />
									<span>{ translate( 'Blogging' ) }</span>
								</StyledLabel>
								<StyledLabel>
									<FormInputCheckbox
										name="survey_goals_website_building"
										onChange={ handleChange }
									/>
									<span>{ translate( 'Website building' ) }</span>
								</StyledLabel>
								<StyledLabel>
									<FormInputCheckbox
										name="survey_goals_website_hosting"
										onChange={ handleChange }
									/>
									<span>{ translate( 'WordPress hosting' ) }</span>
								</StyledLabel>

								<StyledLabel>
									<FormInputCheckbox name="survey_goals_migration" onChange={ handleChange } />
									<span>{ translate( 'Migrating an existing WordPress site' ) }</span>
								</StyledLabel>
							</Shuffle>
							<StyledLabel>
								<ControlledCheckbox
									name="survey_goals_custom_check"
									onChange={ handleChange }
									value={ formState.survey_goals_custom_check }
								/>
								<StyledFormTextInput
									name="survey_goals_custom_text"
									value={ formState.survey_goals_custom_text }
									placeholder={ placeholder }
									onChange={ handleChange }
								/>
							</StyledLabel>
						</OptionsContainer>
					</FormFieldset>
					<FormFieldset>
						<CardHeading tagName="h5" isBold size={ 18 }>
							{ translate( 'What best describes you?' ) }
						</CardHeading>
						<OptionsContainer>
							<Shuffle
								isShuffleActive={ isScrambled }
								getChildKey={ getCheckBoxKey }
								childOrder={ orderDescribeYourself }
								setChildOrder={ setOrderDescribeYourself }
							>
								<StyledLabel>
									<FormInputCheckbox
										name="survey_describe_yourself_creator"
										onChange={ handleChange }
									/>
									<span>{ translate( 'Personal site creator' ) }</span>
								</StyledLabel>
								<StyledLabel>
									<FormInputCheckbox
										name="survey_describe_yourself_business"
										onChange={ handleChange }
									/>
									<span>{ translate( 'Business' ) }</span>
								</StyledLabel>
								<StyledLabel>
									<FormInputCheckbox
										name="survey_describe_yourself_ecommerce"
										onChange={ handleChange }
									/>
									<span>{ translate( 'eCommerce store' ) }</span>
								</StyledLabel>
								<StyledLabel>
									<FormInputCheckbox
										name="survey_describe_yourself_enterprise"
										onChange={ handleChange }
									/>
									<span>{ translate( 'Enterprise' ) }</span>
								</StyledLabel>
								<StyledLabel>
									<FormInputCheckbox
										name="survey_describe_yourself_developer"
										onChange={ handleChange }
									/>
									<span>{ translate( 'Developer' ) }</span>
								</StyledLabel>
								<StyledLabel>
									<FormInputCheckbox
										name="survey_describe_yourself_agency"
										onChange={ handleChange }
									/>
									<span>{ translate( 'Agency' ) }</span>
								</StyledLabel>
							</Shuffle>
							<StyledLabel>
								<ControlledCheckbox
									onChange={ handleChange }
									name="survey_describe_yourself_custom_check"
									value={ formState.survey_describe_yourself_custom_check }
								/>
								<StyledFormTextInput
									name="survey_describe_yourself_custom_text"
									onChange={ handleChange }
									value={ formState.survey_describe_yourself_custom_text }
									placeholder={ placeholder }
								/>
							</StyledLabel>
						</OptionsContainer>
					</FormFieldset>
					<ButtonContainer>
						<Button primary onClick={ handleContinue }>
							{ translate( 'Continue' ) }
						</Button>
					</ButtonContainer>
				</CardContent>
			</StyledCard>
		</SurveyFormContainer>
	);
}

export default function NewUserSurvey( props: Props ) {
	const { flowName, stepName } = props;
	const translate = useTranslate();

	const headerText = translate( 'Please tell us about yourself.' );
	const subHeaderText = translate(
		'We will use the aggregated survey results to learn about our users and improve our services.'
	);

	const handleSkip = () => {
		const { stepName, goToNextStep, submitSignupStep } = props;
		recordTracksEvent( 'calypso_signup_new_user_survey_skip_button_click' );
		submitSignupStep( { stepName, wasSkipped: true } );
		goToNextStep();
	};
	return (
		<StepWrapper
			flowName={ flowName }
			stepName={ stepName }
			stepContent={ <SurveyForm { ...props } /> }
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			isWideLayout={ false }
			isExtraWideLayout
			hideSkip={ false }
			skipButtonAlign="top"
			goToNextStep={ handleSkip }
		/>
	);
}
