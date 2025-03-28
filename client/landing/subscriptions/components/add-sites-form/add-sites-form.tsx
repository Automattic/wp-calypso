import './styles.scss';
import { FormInputValidation } from '@automattic/components';
import { SubscriptionManager } from '@automattic/data-stores';
import { Button, TextControl } from '@wordpress/components';
import { check, Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import FeedPreview from 'calypso/landing/subscriptions/components/add-sites-form/feed-preview/feed-preview';
import { useAddSitesModalNotices } from 'calypso/landing/subscriptions/hooks';
import { useRecordSiteSubscribed } from 'calypso/landing/subscriptions/tracks';
import { isValidUrl, parseUrl } from 'calypso/lib/importer/url-validation';
import { getUrlQuerySearchTerm, setUrlQuery, SEARCH_QUERY_PARAM } from 'calypso/reader/utils';

export type AddSitesFormProps = {
	placeholder?: string;
	buttonText?: string;
	pathname?: string; // Used to prevent search query changes on other pages.
	source: string;
	onChangeFeedPreview?: ( hasPreview: boolean ) => void;
	onChangeSubscribe?: ( subscribed: boolean ) => void;
};

type SubscriptionError = {
	error?: string;
	message?: string;
};

const AddSitesForm = ( {
	placeholder,
	buttonText,
	pathname,
	source,
	onChangeFeedPreview,
	onChangeSubscribe,
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

	// Triggers the text change when component mounts to validate the initial value.
	useEffect( () => onTextFieldChange( getUrlQuerySearchTerm( pathname ), true ), [] ); // eslint-disable-line react-hooks/exhaustive-deps

	function validateInputValue( url: string, showError = false ): void {
		// If the input is empty, we don't want to show an error message
		if ( url.length === 0 ) {
			setIsValidInput( false );
			setInputFieldError( null );
			onChangeFeedPreview?.( false );
			return;
		}

		if ( isValidUrl( url ) ) {
			setInputFieldError( null );
			setIsValidInput( true );
		} else {
			setIsValidInput( false );
			onChangeFeedPreview?.( false );
			if ( showError ) {
				setInputFieldError( translate( 'Please enter a valid URL' ) );
			}
		}
	}

	function onTextFieldChange( value: string, showErrorOnInvalidUrl: boolean = false ): void {
		setUrlQuery( SEARCH_QUERY_PARAM, value, pathname ); // Update url query when search term changes.
		setInputValue( value );
		validateInputValue( value, showErrorOnInvalidUrl );
	}

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
							onSubscribeToggle( true );
						}
					},
					onError: ( error: SubscriptionError ) => {
						showErrorNotice( inputValue, error );
						onChangeSubscribe?.( false );
					},
					onSettled: (): void => {
						setIsSubmitting( false );
					},
				}
			);
		}
	};

	function onSubscribeToggle( subscribed: boolean ): void {
		// Reset form.
		setInputValue( '' );
		setIsValidInput( false );

		onChangeSubscribe?.( subscribed );
	}

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
						onChange={ onTextFieldChange }
						help={ isValidInput ? <Icon icon={ check } data-testid="check-icon" /> : undefined }
						onBlur={ () => validateInputValue( inputValue, true ) }
						__next40pxDefaultSize
						__nextHasNoMarginBottom
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

			<FeedPreview
				url={ isValidInput ? inputValue : '' } // Passing empty state to make sure that debounce works correctly else it was firing events 2 times.
				source={ source }
				onChangeFeedPreview={ onChangeFeedPreview }
				onChangeSubscribe={ onSubscribeToggle }
			/>
		</>
	);
};

export default AddSitesForm;
