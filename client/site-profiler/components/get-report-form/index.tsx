import { FormLabel, FormInputValidation, Gridicon } from '@automattic/components';
import { CheckboxControl, Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { FormEvent, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import wp from 'calypso/lib/wp';
import './styles.scss';

type Errors = {
	name?: string;
	email?: string;
	termsAccepted?: string;
};

export function GetReportForm( { url, onClose }: { url: string; onClose: () => void } ) {
	const [ name, setName ] = useState( '' );
	const [ email, setEmail ] = useState( '' );
	const [ isTermsChecked, setIsTermsChecked ] = useState( false );
	const [ errors, setErrors ] = useState< Errors | null >( null );
	const [ responseError, setResponseError ] = useState< string | null >( null );

	const handleSubmit = async ( e: FormEvent< HTMLFormElement > ) => {
		e.preventDefault();

		const formData = new FormData( e.currentTarget );
		const errors = validateForm( formData );
		if ( errors ) {
			setErrors( errors );
			return;
		}
		setErrors( null );

		let response = null;
		try {
			response = await wp.req.post(
				{
					path: '/site-profiler/lead',
					apiNamespace: 'wpcom/v2',
				},
				{
					name: formData.get( 'name' ),
					email: formData.get( 'email' ),
					url,
				}
			);
		} catch ( error ) {
			setResponseError( error instanceof Error ? error.message : String( error ) );
			return;
		}
		if ( response.status !== 200 ) {
			setResponseError( response.body.message );
		}
	};

	const validateName = ( name: string ) => {
		if ( name ) {
			return null;
		}
		return 'Name is required';
	};
	const validateEmail = ( email: string ) => {
		if ( email ) {
			return null;
		}
		return 'Email is required';
	};
	const validateTerms = ( terms: boolean ) => {
		if ( terms ) {
			return null;
		}
		return 'Terms must be accepted';
	};
	function validateForm( formData: FormData ) {
		let errors = {};
		let hasErrors = false;

		let error = validateName( formData.get( 'name' ) as string );
		if ( error ) {
			errors = { ...errors, name: error };
			hasErrors = true;
		}
		error = validateEmail( formData.get( 'email' ) as string );
		if ( error ) {
			errors = { ...errors, email: error };
			hasErrors = true;
		}
		error = validateTerms( Boolean( formData.get( 'termsAccepted' ) ) );
		if ( error ) {
			errors = { ...errors, termsAccepted: error };
			hasErrors = true;
		}
		return hasErrors ? errors : null;
	}

	const handleNameChange = ( e: FormEvent< HTMLInputElement > ) => {
		const error = validateName( e.currentTarget.value );
		if ( error ) {
			setErrors( { ...errors, name: error } );
		} else {
			setErrors( { ...errors, name: undefined } );
		}
		setName( e.currentTarget.value );
	};

	const handleEmailChange = ( e: FormEvent< HTMLInputElement > ) => {
		const error = validateEmail( e.currentTarget.value );
		if ( error ) {
			setErrors( { ...errors, email: error } );
		} else {
			setErrors( { ...errors, email: undefined } );
		}
		setEmail( e.currentTarget.value );
	};

	const handleTermsChange = ( e: boolean ) => {
		const error = validateTerms( e );
		if ( error ) {
			setErrors( { ...errors, termsAccepted: error } );
		} else {
			setErrors( { ...errors, termsAccepted: undefined } );
		}
		setIsTermsChecked( e );
	};

	const handleClose = () => {
		onClose();
	};

	return (
		<div className="get-report-form__container">
			<div className="get-report-form__title">
				<span className="title">{ translate( 'Get full report' ) }</span>
			</div>
			<div className="get-report-form__body">
				<div className="get-report-form__header">
					<span className="description">
						{ translate(
							'Enter your details below to receive the full report with detailed insights and recommendations for your site.'
						) }
					</span>
					<span>
						<Gridicon icon="chevron-down" onClick={ handleClose } />
					</span>
				</div>
				<form className="get-report-form__form" onSubmit={ handleSubmit }>
					<div className="get-report-form__form-body">
						<FormFieldset>
							<FormLabel htmlFor="name">{ translate( 'Name' ) }</FormLabel>
							<FormTextInput
								name="name"
								className="get-report-form__form-name"
								label={ translate( 'Name' ) }
								value={ name }
								isError={ errors?.name }
								onChange={ handleNameChange }
							/>

							{ errors?.name && <FormInputValidation isError={ !! errors } text={ errors.name } /> }
						</FormFieldset>
						<FormFieldset>
							<FormLabel htmlFor="email">{ translate( 'Email' ) }</FormLabel>
							<FormTextInput
								name="email"
								className="get-report-form__form-email"
								label={ translate( 'Email' ) }
								value={ email }
								isError={ errors?.email }
								onChange={ handleEmailChange }
							/>
							{ errors?.email && (
								<FormInputValidation isError={ !! errors } text={ errors.email } />
							) }
						</FormFieldset>
					</div>
					<div className="get-report-form__form-footer">
						<FormFieldset>
							<CheckboxControl
								name="termsAccepted"
								className="terms-checkbox"
								checked={ isTermsChecked }
								onChange={ handleTermsChange }
								label={ translate(
									`By submitting your details, you agree to WordPress.com‘s Privacy Policy and Terms of Service. You also consent to receiving occasional updates and offers. You can unsubscribe from these communications at any time through the instructions.`
								) }
							/>
							{ errors?.termsAccepted && (
								<FormInputValidation isError={ !! errors } text={ errors.termsAccepted } />
							) }
						</FormFieldset>
						<Button type="submit" className="submit-button">
							{ translate( 'Get my report' ) }
							<Gridicon icon="product-downloadable" />
						</Button>
					</div>
					{ responseError && <FormInputValidation isError={ true } text={ responseError } /> }
				</form>
			</div>
		</div>
	);
}
