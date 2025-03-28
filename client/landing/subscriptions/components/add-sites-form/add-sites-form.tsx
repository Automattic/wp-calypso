import { FormInputValidation } from '@automattic/components';
import { SubscriptionManager } from '@automattic/data-stores';
import { Button, TextControl } from '@wordpress/components';
import { check, Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { isValidUrl, parseUrl } from 'calypso/lib/importer/url-validation';
import { useAddSitesModalNotices } from '../../hooks';
import { useRecordSiteSubscribed } from '../../tracks';
import './styles.scss';

type AddSitesFormProps = {
	onAddFinished?: () => void;
	placeholder?: string;
	buttonText?: string;
	source: string;
};

type SubscriptionError = {
	error?: string;
	message?: string;
};

const AddSitesForm = ( {
	onAddFinished = () => {},
	placeholder,
	buttonText,
	source,
}: AddSitesFormProps ) => {
	const translate = useTranslate();
	const [ inputValue, setInputValue ] = useState( '' );
	const [ isSubmitting, setIsSubmitting ] = useState< boolean >( false );
	const [ inputFieldError, setInputFieldError ] = useState< string | null >( null );
	const [ isValidInput, setIsValidInput ] = useState( false );
	const { showErrorNotice, showWarningNotice, showSuccessNotice } = useAddSitesModalNotices();
	const recordSiteSubscribed = useRecordSiteSubscribed();

	const { mutate: subscribe, isPending: subscribing } =
		SubscriptionManager.useSiteSubscribeMutation();

	const validateInputValue = ( url: string, showError = false ) => {
		// If the input is empty, we don't want to show an error message
		if ( url.length === 0 ) {
			setIsValidInput( false );
			setInputFieldError( null );
			return;
		}

		if ( isValidUrl( url ) ) {
			setInputFieldError( null );
			setIsValidInput( true );
		} else {
			setIsValidInput( false );
			if ( showError ) {
				setInputFieldError( translate( 'Please enter a valid URL' ) );
			}
		}
	};

	const onTextFieldChange = ( value: string ) => {
		setInputValue( value );
		validateInputValue( value );
	};

	const onSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		if ( isValidInput ) {
			setIsSubmitting( true );
			subscribe(
				{ url: parseUrl( inputValue ).toString() },
				{
					onSuccess: ( data ) => {
						if ( data?.info === 'already_subscribed' ) {
							showWarningNotice( inputValue );
						} else {
							if ( data?.subscription?.blog_ID ) {
								recordSiteSubscribed( {
									blog_id: data?.subscription?.blog_ID,
									url: inputValue,
									source,
								} );
							}

							showSuccessNotice( inputValue );

							// Reset fields.
							setInputValue( '' );
							setIsValidInput( false );
						}
						onAddFinished();
					},
					onError: ( error: SubscriptionError ) => {
						showErrorNotice( inputValue, error );
						onAddFinished();
					},
					onSettled: (): void => {
						setIsSubmitting( false );
					},
				}
			);
		}
	};

	return (
		<>
			<form onSubmit={ onSubmit } className="subscriptions-add-sites__form--container">
				<div className="subscriptions-add-sites__form-field">
					<TextControl
						className={ clsx(
							'subscriptions-add-sites__form-input',
							inputFieldError ? 'is-error' : ''
						) }
						disabled={ subscribing }
						placeholder={ placeholder || translate( 'https://www.site.com' ) }
						value={ inputValue }
						type="url"
						onChange={ onTextFieldChange }
						help={ isValidInput ? <Icon icon={ check } data-testid="check-icon" /> : undefined }
						onBlur={ () => validateInputValue( inputValue, true ) }
					/>

					{ inputFieldError ? <FormInputValidation isError text={ inputFieldError } /> : null }
				</div>

				<Button
					variant="primary"
					className="button subscriptions-add-sites__save-button"
					disabled={ ! inputValue || !! inputFieldError || subscribing }
					isBusy={ isSubmitting }
					type="submit"
					__next40pxDefaultSize
				>
					{ buttonText || translate( 'Add site' ) }
				</Button>
			</form>
		</>
	);
};

export default AddSitesForm;
