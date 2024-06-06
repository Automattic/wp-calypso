import { FormLabel, FormInputValidation, Gridicon, Button } from '@automattic/components';
import { CheckboxControl } from '@wordpress/components';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { FormEvent, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import wp from 'calypso/lib/wp';
import * as validators from './validators';
import './styles.scss';

type Errors = {
	name?: string;
	email?: string;
	termsAccepted?: string;
};

export function GetReportForm( {
	url,
	token,
	isOpen,
	onClose,
}: {
	url?: string;
	token?: string;
	isOpen: boolean;
	onClose: () => void;
} ) {
	const [ name, setName ] = useState( '' );
	const [ email, setEmail ] = useState( '' );
	const [ isTermsChecked, setIsTermsChecked ] = useState( false );
	const [ errors, setErrors ] = useState< Errors | null >( null );
	const [ responseError, setResponseError ] = useState< string | null >( null );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ responseSuccess, setResponseSuccess ] = useState( false );

	const handleSubmit = async ( e: FormEvent< HTMLFormElement > ) => {
		e.preventDefault();

		const formData = new FormData( e.currentTarget );
		const errors = validators.validateForm( formData );
		if ( errors ) {
			setErrors( errors );
			return;
		}
		setErrors( null );
		setIsSubmitting( true );

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
					hash: token,
				}
			);
		} catch ( error ) {
			setResponseError( error instanceof Error ? error.message : String( error ) );
			return;
		} finally {
			setIsSubmitting( false );
		}
		if ( response.success ) {
			setResponseSuccess( true );
		}
	};

	const handleNameChange = ( e: FormEvent< HTMLInputElement > ) => {
		const error = validators.validateName( e.currentTarget.value );
		if ( error ) {
			setErrors( { ...errors, name: error } );
		} else {
			setErrors( { ...errors, name: undefined } );
		}
		setName( e.currentTarget.value );
	};

	const handleEmailChange = ( e: FormEvent< HTMLInputElement > ) => {
		const error = validators.validateEmail( e.currentTarget.value );
		if ( error ) {
			setErrors( { ...errors, email: error } );
		} else {
			setErrors( { ...errors, email: undefined } );
		}
		setEmail( e.currentTarget.value );
	};

	const handleTermsChange = ( e: boolean ) => {
		const error = validators.validateTerms( e );
		if ( error ) {
			setErrors( { ...errors, termsAccepted: error } );
		} else {
			setErrors( { ...errors, termsAccepted: undefined } );
		}
		setIsTermsChecked( e );
	};

	return (
		<div
			className={ clsx( 'get-report-form__wrapper', {
				'get-report-form__wrapper--hidden': ! isOpen,
			} ) }
		>
			{ ! responseSuccess && (
				<div className="get-report-form__container">
					<div className="get-report-form__title">
						<span className="title">{ translate( 'Full site report' ) }</span>
					</div>
					<div className="get-report-form__body">
						<div className="get-report-form__header">
							<span className="description">
								{ translate(
									"To access a detailed report complete with insights and tailored recommendations for improving your site's performance, please provide your details below. We'll send you an exclusive link to view the full analysis, helping you make informed decisions for optimizing your site."
								) }
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
										isError={ !! errors?.name }
										onChange={ handleNameChange }
									/>

									{ errors?.name && <FormInputValidation isError text={ errors.name } /> }
								</FormFieldset>
								<FormFieldset>
									<FormLabel htmlFor="email">{ translate( 'Email address' ) }</FormLabel>
									<FormTextInput
										name="email"
										className="get-report-form__form-email"
										label={ translate( 'Email' ) }
										value={ email }
										isError={ !! errors?.email }
										onChange={ handleEmailChange }
									/>
									{ errors?.email && <FormInputValidation isError text={ errors.email } /> }
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
										<FormInputValidation isError text={ errors.termsAccepted } />
									) }
								</FormFieldset>
								<Button
									type="submit"
									className="submit-button"
									busy={ isSubmitting }
									disabled={ responseSuccess }
								>
									{ translate( 'Access full report' ) }
								</Button>
							</div>
							{ responseError && <FormInputValidation isError text={ responseError } /> }
							{ responseSuccess && (
								<FormInputValidation
									isError={ false }
									text="Success! An email with the report link will be sent shortly"
								/>
							) }
						</form>
					</div>
					<Gridicon icon="chevron-down" size={ 36 } onClick={ onClose } />
				</div>
			) }
			{ responseSuccess && (
				<div className="get-report-form__container">
					<div className="get-report-form__title">
						<span className="title">{ translate( 'Full site report' ) }</span>
					</div>
					<div className="get-report-form__header get-report-form__body">
						<span className="description">
							{ translate(
								'Your request for a full site report has been received. Check your email for an exclusive link to view the detailed analysis.'
							) }
						</span>
					</div>
					<span>
						<Gridicon icon="chevron-down" size={ 36 } onClick={ onClose } />
					</span>
				</div>
			) }
		</div>
	);
}
