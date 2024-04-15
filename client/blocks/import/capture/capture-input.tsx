import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, FormLabel } from '@automattic/components';
import { NextButton } from '@automattic/onboarding';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { Icon, info } from '@wordpress/icons';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React, { ChangeEvent, FormEvent, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { CAPTURE_URL_RGX } from 'calypso/blocks/import/util';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import type { OnInputChange, OnInputEnter } from './types';
import type { FunctionComponent } from 'react';

interface Props {
	onInputEnter: OnInputEnter;
	onInputChange?: OnInputChange;
	onDontHaveSiteAddressClick?: () => void;
	hasError?: boolean;
	skipInitialChecking?: boolean;
}
const CaptureInput: FunctionComponent< Props > = ( props ) => {
	const { onInputEnter, onInputChange, onDontHaveSiteAddressClick, hasError, skipInitialChecking } =
		props;

	const translate = useTranslate();
	const [ urlValue, setUrlValue ] = useState( '' );
	const [ isValid, setIsValid ] = useState( false );
	const [ submitted, setSubmitted ] = useState( false );
	const lastInvalidValue = useRef< string | undefined >();
	const exampleInputWebsite = 'artfulbaker.blog';
	const showValidationMsg = hasError || ( submitted && ! isValid );
	const { search } = useLocation();

	useEffect( () => checkInitSubmissionState(), [] );

	function checkInitSubmissionState() {
		const urlValue = new URLSearchParams( search ).get( 'from' ) || '';
		if ( skipInitialChecking ) {
			setUrlValue( urlValue );
			validateUrl( urlValue );
			return;
		}

		if ( urlValue ) {
			const isValid = CAPTURE_URL_RGX.test( urlValue );
			if ( isValid && ! hasError ) {
				onInputEnter( urlValue );
				setSubmitted( true );
			} else {
				setUrlValue( urlValue );
			}
		}
	}

	function validateUrl( url: string ) {
		const isValid = CAPTURE_URL_RGX.test( url );
		setIsValid( isValid );
	}

	function onChange( e: ChangeEvent< HTMLInputElement > ) {
		const trimmedValue = e.target.value.trim();
		setUrlValue( trimmedValue );
		validateUrl( trimmedValue );
		onInputChange?.( trimmedValue );
	}

	function onFormSubmit( e: FormEvent< HTMLFormElement > ) {
		e.preventDefault();
		isValid && onInputEnter( urlValue );
		setSubmitted( true );

		if ( ! isValid && urlValue?.length > 4 && urlValue !== lastInvalidValue.current ) {
			lastInvalidValue.current = urlValue;
			recordTracksEvent( 'calypso_importer_capture_input_invalid', {
				url: urlValue,
			} );
		}
	}

	return (
		<form className="import__capture" onSubmit={ onFormSubmit }>
			<FormFieldset>
				<FormLabel htmlFor="capture-site-url">
					{ translate( 'Enter the URL of the site:' ) }
				</FormLabel>
				<FormTextInput
					id="capture-site-url"
					type="text"
					className={ classnames( { 'is-error': showValidationMsg } ) }
					// eslint-disable-next-line jsx-a11y/no-autofocus
					autoFocus
					autoComplete="off"
					autoCorrect="off"
					spellCheck="false"
					value={ urlValue }
					placeholder={ exampleInputWebsite }
					onChange={ onChange }
				/>

				<FormSettingExplanation>
					<span className={ classnames( { 'is-error': showValidationMsg } ) }>
						{ showValidationMsg && (
							<>
								<Icon icon={ info } size={ 20 } />{ ' ' }
								{ translate( 'Please enter a valid website address. You can copy and paste.' ) }
							</>
						) }
					</span>
				</FormSettingExplanation>
			</FormFieldset>

			<NextButton type="submit">{ translate( 'Continue' ) }</NextButton>

			<div className="action-buttons__importer-list">
				{ onDontHaveSiteAddressClick &&
					createInterpolateElement( translate( 'Or <button>choose a content platform</button>' ), {
						button: createElement( Button, {
							borderless: true,
							onClick: onDontHaveSiteAddressClick,
						} ),
					} ) }
			</div>
		</form>
	);
};

export default CaptureInput;
