import { Button, FormInputValidation } from '@automattic/components';
import { SubscriptionManager } from '@automattic/data-stores';
import { TextControl } from '@wordpress/components';
import { check, Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { isValidUrl } from '../../helpers';
import { useAddSitesModalNotices } from '../../hooks';
import { SOURCE_SUBSCRIPTIONS_ADD_SITES_MODAL, useRecordSiteSubscribed } from '../../tracks';
import './styles.scss';

type AddSitesFormProps = {
	onAddFinished: () => void;
};

const AddSitesForm = ( { onAddFinished }: AddSitesFormProps ) => {
	const translate = useTranslate();
	const [ inputValue, setInputValue ] = useState( '' );
	const [ inputFieldError, setInputFieldError ] = useState< string | null >( null );
	const [ isValidInput, setIsValidInput ] = useState( false );
	const { showErrorNotice, showWarningNotice, showSuccessNotice } = useAddSitesModalNotices();
	const recordSiteSubscribed = useRecordSiteSubscribed();

	const { mutate: subscribe, isPending: subscribing } =
		SubscriptionManager.useSiteSubscribeMutation();

	const validateInputValue = useCallback(
		( url: string, showError = false ) => {
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
		},
		[ translate ]
	);

	const onTextFieldChange = useCallback(
		( value: string ) => {
			setInputValue( value );
			validateInputValue( value );
		},
		[ validateInputValue ]
	);

	const onAddSite = useCallback( () => {
		if ( isValidInput ) {
			subscribe(
				{ url: inputValue },
				{
					onSuccess: ( data ) => {
						if ( data?.info === 'already_subscribed' ) {
							showWarningNotice( inputValue );
						} else {
							if ( data?.subscription?.blog_ID ) {
								recordSiteSubscribed( {
									blog_id: data?.subscription?.blog_ID,
									url: inputValue,
									source: SOURCE_SUBSCRIPTIONS_ADD_SITES_MODAL,
								} );
							}

							showSuccessNotice( inputValue );
						}
						onAddFinished();
					},
					onError: () => {
						showErrorNotice( inputValue );
						onAddFinished();
					},
				}
			);
		}
	}, [
		inputValue,
		isValidInput,
		onAddFinished,
		recordSiteSubscribed,
		showErrorNotice,
		showSuccessNotice,
		showWarningNotice,
		subscribe,
	] );

	return (
		<div className="subscriptions-add-sites__form--container">
			<TextControl
				className={ clsx(
					'subscriptions-add-sites__form-input',
					inputFieldError ? 'is-error' : ''
				) }
				disabled={ subscribing }
				placeholder={ translate( 'https://www.site.com' ) }
				value={ inputValue }
				type="url"
				onChange={ onTextFieldChange }
				help={ isValidInput ? <Icon icon={ check } data-testid="check-icon" /> : undefined }
				onBlur={ () => validateInputValue( inputValue, true ) }
			/>

			{ inputFieldError ? <FormInputValidation isError text={ inputFieldError } /> : null }

			<Button
				primary
				className="subscriptions-add-sites__save-button"
				disabled={ ! inputValue || !! inputFieldError || subscribing }
				onClick={ onAddSite }
			>
				{ translate( 'Add site' ) }
			</Button>
		</div>
	);
};

export default AddSitesForm;
