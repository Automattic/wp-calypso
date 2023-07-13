import { FormInputValidation } from '@automattic/components';
import { TextControl } from '@wordpress/components';
import { check, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { CAPTURE_URL_RGX } from 'calypso/blocks/import/util';
import './styles.scss';

type AddSitesFormProps = {
	recordTracksEvent: ( eventName: string, eventProperties?: Record< string, unknown > ) => void;
	onClose: () => void;
	onAddFinished: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AddSitesForm = ( { recordTracksEvent, onClose, onAddFinished }: AddSitesFormProps ) => {
	const translate = useTranslate();
	const [ inputValue, setInputValue ] = useState( '' );
	const [ inputFieldError, setInputFieldError ] = useState< string | null >( null );
	const [ isValidUrl, setIsValidUrl ] = useState( false );
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [ isUploading, setIsUploading ] = useState( false );

	const handleInvalidUrl = useCallback(
		( showError: boolean ) => {
			setIsValidUrl( false );
			if ( showError ) {
				setInputFieldError( translate( 'Please enter a valid URL' ) );
			}
		},
		[ translate ]
	);

	const handleValidUrl = useCallback( () => {
		setIsValidUrl( true );
		setInputFieldError( null );
	}, [] );

	const validateInputValue = useCallback(
		( url: string, showError = false ) => {
			if ( url.length === 0 || ! CAPTURE_URL_RGX.test( url ) ) {
				handleInvalidUrl( showError );
			} else {
				handleValidUrl();
			}
		},
		[ translate, handleInvalidUrl, handleValidUrl ]
	);

	const onTextFieldChange = useCallback(
		( value: string ) => {
			setInputValue( value );
			validateInputValue( value );
		},
		[ inputFieldError, validateInputValue ]
	);

	return (
		<div className="subscriptions-add-sites__form--container">
			<label className="subscriptions-add-sites__form-label-url">
				<strong>{ translate( 'Address' ) }</strong>
			</label>

			<TextControl
				className={ inputFieldError ? 'is-error' : '' }
				disabled={ isUploading }
				placeholder={ translate( 'https://www.site.com' ) }
				value={ inputValue }
				type="url"
				onChange={ onTextFieldChange }
				help={ isValidUrl ? <Icon icon={ check } /> : undefined }
				onBlur={ () => validateInputValue( inputValue, true ) }
			/>

			{ inputFieldError ? <FormInputValidation isError={ true } text={ inputFieldError } /> : null }
		</div>
	);
};

export default AddSitesForm;
