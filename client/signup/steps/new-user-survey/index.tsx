import { Button } from '@automattic/components';
import { useDesktopBreakpoint, useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useState } from 'react';
import CardHeading from 'calypso/components/card-heading';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import StepWrapper from 'calypso/signup/step-wrapper';
import {
	ButtonContainer,
	CardContent,
	OptionsContainer,
	Shuffle,
	StyledCard,
	StyledFormTextInput,
	StyledLabel,
	SurveyFormContainer,
	Viewport,
} from './components';

const defaultFormState = {
	survey_goals_blogging: false,
	survey_goals_website_building: false,
	survey_goals_wordpress_hosting: false,
	survey_goals_custom_check: false,
	survey_goals_custom_text: '',
	survey_describe_yourself_creator: false,
	survey_describe_yourself_business: false,
	survey_describe_yourself_ecommerce: false,
	survey_describe_yourself_enterprise: false,
	survey_describe_yourself_developer: false,
	survey_describe_yourself_agency: false,
	survey_describe_yourself_custom_check: false,
	survey_describe_yourself_custom_text: '',
};
type FormState = typeof defaultFormState;

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

function SurveyForm( props: Props ) {
	const [ formState, setFormState ] = useState< FormState >( defaultFormState );
	const translate = useTranslate();
	const isMobileViewport = useMobileBreakpoint();
	const isDesktopViewport = useDesktopBreakpoint();

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
				[ name ]: ! formState[ name ],
			} ) );
		}
	};

	const handleContinue = () => {
		const { stepName, goToNextStep, submitSignupStep } = props;
		submitSignupStep( { stepName }, {}, { ...formState } );
		goToNextStep();
	};

	let currentViewport: Viewport = 'tablet';
	if ( isMobileViewport ) {
		currentViewport = 'mobile';
	} else if ( isDesktopViewport ) {
		currentViewport = 'desktop';
	}

	const placeholder =
		currentViewport === 'mobile'
			? translate( 'Please fill in your own answer' )
			: translate( 'None of the above (Please fill in your own answer)' );

	return (
		<SurveyFormContainer currentViewport={ currentViewport }>
			<StyledCard currentViewport={ currentViewport }>
				<CardContent>
					<FormFieldset>
						<CardHeading tagName="h5" isBold={ true } size={ 18 }>
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
							<Shuffle>
								<StyledLabel>
									<FormInputCheckbox
										checked={ formState.survey_goals_blogging }
										name="survey_goals_blogging"
										onChange={ handleChange }
									/>
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
							</Shuffle>
							<StyledLabel>
								<FormInputCheckbox
									checked={ formState.survey_goals_custom_check }
									name="survey_goals_custom_check"
									onChange={ handleChange }
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
						<CardHeading tagName="h5" isBold={ true } size={ 18 }>
							{ translate( 'What best describes you?' ) }
						</CardHeading>
						<OptionsContainer>
							<Shuffle>
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
								<StyledLabel>
									<FormInputCheckbox
										onChange={ handleChange }
										checked={ formState.survey_describe_yourself_custom_check }
										name="survey_describe_yourself_custom_check"
									/>
									<StyledFormTextInput
										name="survey_describe_yourself_custom_text"
										onChange={ handleChange }
										value={ formState.survey_describe_yourself_custom_text }
										placeholder={ placeholder }
									/>
								</StyledLabel>
							</Shuffle>
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
			isExtraWideLayout={ true }
			hideSkip={ false }
			skipButtonAlign="top"
			goToNextStep={ handleSkip }
		/>
	);
}
