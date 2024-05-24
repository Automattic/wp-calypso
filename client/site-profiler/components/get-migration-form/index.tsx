import { FormLabel, FormInputValidation, Gridicon, Button } from '@automattic/components';
import { CheckboxControl } from '@wordpress/components';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';
import { FormEvent, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import * as validators from './validators';
import './styles.scss';

type Errors = {
	name?: string;
	email?: string;
	siteUrl?: string;
	termsAccepted?: string;
};

type GetMigrationFormProps = {
	domain?: string;
	isOpen: boolean;
	onClose: () => void;
};

export function GetMigrationForm( { domain, isOpen, onClose }: GetMigrationFormProps ) {
	const [ name, setName ] = useState( '' );
	const [ email, setEmail ] = useState( '' );
	const [ company, setCompany ] = useState( '' );
	const [ siteUrl, setSiteUrl ] = useState( domain );
	const [ notes, setNotes ] = useState( '' );
	const [ isTermsChecked, setIsTermsChecked ] = useState( false );
	const [ errors, setErrors ] = useState< Errors | null >( null );
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
		setResponseSuccess( true );
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

	const handleSiteUrlChange = ( e: FormEvent< HTMLInputElement > ) => {
		const error = validators.validateSiteUrl( e.currentTarget.value );
		if ( error ) {
			setErrors( { ...errors, siteUrl: error } );
		} else {
			setErrors( { ...errors, siteUrl: undefined } );
		}
		setSiteUrl( e.currentTarget.value );
	};

	return (
		<div
			className={ classnames( 'get-migration-form__wrapper', {
				'get-migration-form__wrapper--hidden': ! isOpen,
			} ) }
		>
			{ responseSuccess ? (
				<div className="get-migration-form__container">
					<div className="get-migration-form__body">
						<div className="get-migration-form__header">
							<span className="description">
								{ translate(
									"Thank you for your request! We'll contact you soon to start your site's migration to WordPress.com."
								) }
							</span>
							<span>
								<Gridicon icon="chevron-down" onClick={ onClose } />
							</span>
						</div>
					</div>
				</div>
			) : (
				<div className="get-migration-form__container">
					<div className="get-migration-form__title">
						<span className="title">{ translate( 'Site migration' ) }</span>
					</div>
					<div className="get-migration-form__body">
						<div className="get-migration-form__header">
							<span className="description">
								{ translate(
									"Migrate your site to WordPress.com for a test run without affecting your live site. Experience improved speed and reliability firsthand. We'll handle everything and guide you through connecting your domain. Ready to see the difference?"
								) }
							</span>
							<span>
								<Gridicon icon="chevron-down" onClick={ onClose } />
							</span>
						</div>
						<form className="get-migration-form__form" onSubmit={ handleSubmit }>
							<div className="get-migration-form__form-body">
								<FormFieldset>
									<FormLabel htmlFor="name">{ translate( 'Name' ) }</FormLabel>
									<FormTextInput
										name="name"
										className="get-migration-form__form-name"
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
										className="get-migration-form__form-email"
										label={ translate( 'Email address' ) }
										value={ email }
										isError={ !! errors?.email }
										onChange={ handleEmailChange }
									/>
									{ errors?.email && <FormInputValidation isError text={ errors.email } /> }
								</FormFieldset>
								<FormFieldset>
									<FormLabel htmlFor="company">{ translate( 'Company' ) }</FormLabel>
									<FormTextInput
										name="company"
										className="get-migration-form__form-company"
										label={ translate( 'Company' ) }
										value={ company }
										onChange={ ( e: FormEvent< HTMLInputElement > ) =>
											setCompany( e.currentTarget.value )
										}
									/>
								</FormFieldset>
								<FormFieldset>
									<FormLabel htmlFor="siteUrl">
										{ translate( 'URL of the website you would like to transfer' ) }
									</FormLabel>
									<FormTextInput
										name="siteUrl"
										className="get-migration-form__form-siteurl"
										label={ translate( 'URL of the website you would like to transfer' ) }
										value={ siteUrl }
										isError={ !! errors?.siteUrl }
										onChange={ handleSiteUrlChange }
									/>
									{ errors?.siteUrl && <FormInputValidation isError text={ errors.siteUrl } /> }
								</FormFieldset>
								<FormFieldset>
									<FormLabel htmlFor="notes">
										{ translate( 'Share more with us about the site you’d like to transfer!' ) }
									</FormLabel>
									<FormTextarea
										name="notes"
										className="get-migration-form__form-notes"
										label={ translate(
											'Share more with us about the site you’d like to transfer!'
										) }
										value={ notes }
										onChange={ ( e: FormEvent< HTMLInputElement > ) =>
											setNotes( e.currentTarget.value )
										}
									/>
								</FormFieldset>
							</div>
							<div className="get-migration-form__form-footer">
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
									{ translate( 'Request my free migration' ) }
								</Button>
							</div>
							{ responseSuccess && (
								<FormInputValidation
									isError={ false }
									text="Thank you for your request! We'll contact you soon to start your site's migration to WordPress.com."
								/>
							) }
						</form>
					</div>
				</div>
			) }
		</div>
	);
}
