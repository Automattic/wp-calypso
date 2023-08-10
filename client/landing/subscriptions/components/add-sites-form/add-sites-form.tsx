import { Button, FormInputValidation } from '@automattic/components';
import { SubscriptionManager } from '@automattic/data-stores';
import { TextControl } from '@wordpress/components';
import { check, Icon } from '@wordpress/icons';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CAPTURE_URL_RGX } from 'calypso/blocks/import/util';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import './styles.scss';

type AddSitesFormProps = {
	onAddFinished: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AddSitesForm = ( { onAddFinished }: AddSitesFormProps ) => {
	const translate = useTranslate();
	const [ inputValue, setInputValue ] = useState( '' );
	const [ inputFieldError, setInputFieldError ] = useState< string | null >( null );
	const [ isValidUrl, setIsValidUrl ] = useState( false );
	const dispatch = useDispatch();

	const { mutate: subscribe, isLoading: subscribing } =
		SubscriptionManager.useSiteSubscribeMutation();

	const validateInputValue = useCallback(
		( url: string, showError = false ) => {
			if ( url.length === 0 ) {
				setIsValidUrl( false );
				setInputFieldError( null );
				return;
			}
			if ( ! CAPTURE_URL_RGX.test( url ) ) {
				setIsValidUrl( false );
				if ( showError ) {
					setInputFieldError( translate( 'Please enter a valid URL' ) );
				}
			} else {
				setInputFieldError( null );
				setIsValidUrl( true );
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
		if ( isValidUrl ) {
			subscribe(
				{ url: inputValue },
				{
					onSuccess: () => {
						dispatch(
							successNotice(
								translate( 'You have successfully subscribed to %s.', {
									args: [ inputValue ],
									comment: 'URL of the site that the user has subscribed to.',
								} )
							)
						);
						onAddFinished();
					},
					onError: () => {
						dispatch(
							errorNotice(
								translate( 'There was an error when trying to subscribe to %s.', {
									args: [ inputValue ],
									comment: 'URL of the site that the user tried to subscribe to.',
								} )
							)
						);
					},
				}
			);
		}
	}, [ dispatch, inputValue, isValidUrl, onAddFinished, subscribe, translate ] );

	return (
		<div className="subscriptions-add-sites__form--container">
			<TextControl
				className={ classnames(
					'subscriptions-add-sites__form-input',
					inputFieldError ? 'is-error' : ''
				) }
				disabled={ subscribing }
				placeholder={ translate( 'https://www.site.com' ) }
				value={ inputValue }
				type="url"
				onChange={ onTextFieldChange }
				help={ isValidUrl ? <Icon icon={ check } data-testid="check-icon" /> : undefined }
				onBlur={ () => validateInputValue( inputValue, true ) }
			/>

			{ inputFieldError ? <FormInputValidation isError={ true } text={ inputFieldError } /> : null }

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
