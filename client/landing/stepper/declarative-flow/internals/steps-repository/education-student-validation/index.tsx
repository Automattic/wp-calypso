import { FormInputValidation, FormLabel } from '@automattic/components';
import { Step } from '@automattic/onboarding';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { ChangeEvent, FormEvent, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { useValidateEducationStudentCode } from './hooks/use-validate-education-student-code';
import type { Step as StepType } from '../../types';
import './style.scss';

const INPUT_ID = 'education-student-validation-code';
const ERROR_ID = 'education-student-validation-code-error';

const EducationStudentValidation: StepType< {
	submits: {
		inviteCodeValidated: true;
	};
} > = function EducationStudentValidation( { navigation } ) {
	const { __ } = useI18n();
	const [ code, setCode ] = useState( '' );
	const [ hasError, setHasError ] = useState( false );
	const { mutateAsync: validateCode, isPending } = useValidateEducationStudentCode();

	const trimmedCode = code.trim();
	const title = __( 'Welcome to the WordPress.com Education Program' );
	const errorMessage = __( 'Invitation code not found' );
	const subText = createInterpolateElement(
		__(
			'Please provide your invite code below. If you do not have an invite code, or would like to enroll your educational institution in the program, please head over to <link>wp.com/edu</link>.'
		),
		{
			link: <a href="https://wp.com/edu" target="_blank" rel="noreferrer" />,
		}
	);

	const onSubmit = async ( event: FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		if ( ! trimmedCode || isPending ) {
			return;
		}

		setHasError( false );

		try {
			const { success } = await validateCode( trimmedCode );

			if ( ! success ) {
				setHasError( true );
				return;
			}

			navigation.submit( { inviteCodeValidated: true } );
		} catch {
			setHasError( true );
		}
	};

	return (
		<>
			<DocumentHead title={ title } />
			<Step.CenteredColumnLayout
				columnWidth={ 4 }
				heading={ <Step.Heading text={ title } subText={ subText } /> }
				verticalAlign="center"
				className="education-student-validation"
			>
				<form className="education-student-validation__form" onSubmit={ onSubmit }>
					<div className="education-student-validation__field">
						<FormLabel htmlFor={ INPUT_ID }>{ __( 'Invitation code' ) }</FormLabel>
						<FormTextInput
							id={ INPUT_ID }
							value={ code }
							isError={ hasError }
							autoComplete="off"
							// eslint-disable-next-line jsx-a11y/no-autofocus
							autoFocus
							aria-invalid={ hasError }
							aria-describedby={ hasError ? ERROR_ID : undefined }
							onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
								setCode( event.currentTarget.value );
								setHasError( false );
							} }
						/>
						{ hasError && <FormInputValidation id={ ERROR_ID } isError text={ errorMessage } /> }
					</div>
					<Step.PrimaryButton
						type="submit"
						disabled={ isPending || ! trimmedCode }
						isBusy={ isPending }
					>
						{ isPending ? __( 'Validating' ) : __( 'Validate invite code' ) }
					</Step.PrimaryButton>
				</form>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default EducationStudentValidation;
