import {
	FormInputValidation,
	FormLabel,
	WordPressLogo,
	WordPressWordmark,
} from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { Step } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { globe, help, Icon, lock, pencil } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { ChangeEvent, FormEvent, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { EduBackdrop } from './edu-backdrop';
import { EduProgramLogo } from './edu-program-logo';
import { useValidateEducationStudentCode } from './hooks/use-validate-education-student-code';
import type { Step as StepType } from '../../types';
import type { HelpCenterSelect } from '@automattic/data-stores';

import './style.scss';

const INPUT_ID = 'education-student-validation-code';
const ERROR_ID = 'education-student-validation-code-error';

const HELP_CENTER_STORE = HelpCenter.register();

type ValidationError = 'invalid' | 'rate_limited' | 'unknown';

const classifyValidationError = ( validationError: unknown ): ValidationError => {
	const { code, status, statusCode, data } = ( validationError ?? {} ) as {
		code?: string;
		status?: number;
		statusCode?: number;
		data?: { status?: number };
	};
	const httpStatus = status ?? statusCode ?? data?.status;

	if ( code === 'invalid_education_student_code' || httpStatus === 400 ) {
		return 'invalid';
	}

	if ( code === 'rate_limit_exceeded' || httpStatus === 429 ) {
		return 'rate_limited';
	}

	return 'unknown';
};

const EducationStudentValidation: StepType< {
	submits: {
		inviteCodeValidated: true;
	};
} > = function EducationStudentValidation( { navigation, flow } ) {
	const { __ } = useI18n();
	const [ code, setCode ] = useState( '' );
	const [ error, setError ] = useState< ValidationError | null >( null );
	const { mutateAsync: validateCode, isPending } = useValidateEducationStudentCode();

	const { setShowHelpCenter } = useDispatch( HELP_CENTER_STORE );
	const isHelpCenterShown = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).isHelpCenterShown(),
		[]
	);
	const toggleHelpCenter = () => {
		if ( ! isHelpCenterShown ) {
			recordTracksEvent( 'calypso_onboarding_help_center_click', {
				flow,
				step: 'education-student-validation',
			} );
		}
		setShowHelpCenter( ! isHelpCenterShown );
	};

	const trimmedCode = code.trim();
	const title = __( 'Your site starts here' );
	const subText = __(
		'Your instructor set you up with a free WordPress.com site. Get it up and running in a few minutes. Keep it long after the course ends.'
	);
	const errorMessages: Record< ValidationError, string > = {
		invalid: __( 'Invitation code not found' ),
		rate_limited: __( 'Too many attempts. Please wait a moment and try again.' ),
		unknown: __( 'Something went wrong. Please try again.' ),
	};
	const enrollNote = createInterpolateElement(
		__( 'Don’t have a code? <link>Learn more about the program at wp.com/edu</link>' ),
		{
			link: <a href="https://wp.com/edu" target="_blank" rel="noopener noreferrer" />,
		}
	);

	const programSteps = [
		{
			number: '01',
			icon: lock,
			title: __( 'Enter your invite code' ),
			description: __( 'Use the code your instructor sent over to get started.' ),
		},
		{
			number: '02',
			icon: globe,
			title: __( 'Name your site' ),
			description: __( 'Pick a domain name and set up your site in a couple of clicks.' ),
		},
		{
			number: '03',
			icon: pencil,
			title: __( 'Start publishing' ),
			description: __(
				'Whatever you build here is yours to keep. Your site stays live after the course ends.'
			),
		},
	];

	const failValidation = ( reason: ValidationError ) => {
		setError( reason );
		recordTracksEvent( 'calypso_education_student_validation_failed', { flow, reason } );
	};

	const onSubmit = async ( event: FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		if ( ! trimmedCode || isPending ) {
			return;
		}

		setError( null );

		try {
			const { success } = await validateCode( trimmedCode );

			if ( ! success ) {
				failValidation( 'invalid' );
				return;
			}

			navigation.submit( { inviteCodeValidated: true } );
		} catch ( validationError ) {
			failValidation( classifyValidationError( validationError ) );
		}
	};

	return (
		<>
			<DocumentHead title={ title } />
			<Step.CenteredColumnLayout
				columnWidth={ 8 }
				topBar={
					<Step.TopBar
						logo={
							<div className="step-container-v2__top-bar-wordpress-logo-wrapper education-student-validation__top-bar-logo">
								<WordPressWordmark
									className="step-container-v2__top-bar-wordpress-logo step-container-v2__top-bar-wordpress-logo--wordmark"
									color="currentColor"
								/>
								<WordPressLogo
									size={ 21 }
									className="step-container-v2__top-bar-wordpress-logo step-container-v2__top-bar-wordpress-logo--logo"
								/>
							</div>
						}
						rightElement={
							<Step.LinkButton icon={ help } iconSize={ 20 } onClick={ toggleHelpCenter }>
								{ __( 'Need help?' ) }
							</Step.LinkButton>
						}
					/>
				}
				heading={
					<div className="education-student-validation__heading">
						<EduBackdrop />
						<EduProgramLogo className="education-student-validation__logo" />
						<Step.Heading align="center" text={ title } subText={ subText } />
					</div>
				}
				verticalAlign="center"
				className="education-student-validation"
			>
				<ol className="education-student-validation__steps">
					{ programSteps.map( ( programStep ) => (
						<li key={ programStep.number } className="education-student-validation__step">
							<div className="education-student-validation__step-marker" aria-hidden="true">
								<span className="education-student-validation__step-number">
									{ programStep.number }
								</span>
								<span className="education-student-validation__step-rule" />
							</div>
							<div className="education-student-validation__step-icon">
								<Icon icon={ programStep.icon } size={ 22 } />
							</div>
							<h3 className="education-student-validation__step-title">{ programStep.title }</h3>
							<p className="education-student-validation__step-description">
								{ programStep.description }
							</p>
						</li>
					) ) }
				</ol>
				<form className="education-student-validation__form" onSubmit={ onSubmit }>
					<div className="education-student-validation__field">
						<FormLabel htmlFor={ INPUT_ID }>{ __( 'Invitation code' ) }</FormLabel>
						<FormTextInput
							id={ INPUT_ID }
							value={ code }
							placeholder="XXXXXX"
							isError={ !! error }
							autoComplete="off"
							// eslint-disable-next-line jsx-a11y/no-autofocus
							autoFocus
							aria-invalid={ !! error }
							aria-describedby={ error ? ERROR_ID : undefined }
							onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
								setCode( event.currentTarget.value );
								setError( null );
							} }
						/>
						{ error && (
							<FormInputValidation id={ ERROR_ID } isError text={ errorMessages[ error ] } />
						) }
					</div>
					<Step.PrimaryButton
						type="submit"
						disabled={ isPending || ! trimmedCode }
						isBusy={ isPending }
					>
						{ isPending ? __( 'Validating' ) : __( 'Validate invite code' ) }
					</Step.PrimaryButton>
					<p className="education-student-validation__enroll-note">{ enrollNote }</p>
				</form>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default EducationStudentValidation;
