import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, FormLabel } from '@automattic/components';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { NextButton } from '@automattic/onboarding';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { Icon, info } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React, { ChangeEvent, FormEvent, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { CAPTURE_URL_RGX } from 'calypso/blocks/import/util';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import type { OnInputChange, OnInputEnter } from './types';
import type { FunctionComponent, ReactNode } from 'react';

interface Props {
	dontHaveSiteAddressLabel?: string;
	hasError?: boolean;
	hideImporterListLink?: boolean;
	label?: ReactNode;
	nextLabelText?: string;
	onDontHaveSiteAddressClick?: () => void;
	onInputChange?: OnInputChange;
	onInputEnter: OnInputEnter;
	placeholder?: string;
	skipInitialChecking?: boolean;
}
const CaptureInput: FunctionComponent< Props > = ( props ) => {
	const {
		onInputEnter,
		onInputChange,
		onDontHaveSiteAddressClick,
		hasError,
		skipInitialChecking,
		label,
		placeholder = 'artfulbaker.blog',
		dontHaveSiteAddressLabel,
		hideImporterListLink = false,
		nextLabelText,
	} = props;

	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const [ urlValue, setUrlValue ] = useState( '' );
	const [ isValid, setIsValid ] = useState( false );
	const [ submitted, setSubmitted ] = useState( false );
	const [ validationMessage, setValidationMessage ] = useState( '' );
	const lastInvalidValue = useRef< string | undefined >();
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
		const tempValidationMessage = isValid ? '' : getValidationMessage( url );
		setValidationMessage( tempValidationMessage );
	}

	// TODO: Just return the translated string directly from getValidationMessage once we have translations for all messages.
	const errorMessages = {
		'no-tld': {
			message: translate(
				'Your URL is missing a top-level domain (e.g., .com, .net, etc.). Example URL: example.com'
			),
			messageString:
				'Your URL is missing a top-level domain (e.g., .com, .net, etc.). Example URL: example.com',
		},
		email: {
			message: translate(
				'It looks like you’ve entered an email address. Please enter a valid URL instead (e.g., example.com).'
			),
			messageString:
				'It looks like you’ve entered an email address. Please enter a valid URL instead (e.g., example.com).',
		},
		'invalid-chars': {
			message: translate(
				'URL contains invalid characters. Please remove special characters and enter a valid URL (e.g., example.com)'
			),
			messageString:
				'URL contains invalid characters. Please remove special characters and enter a valid URL (e.g., example.com)',
		},
		'invalid-protocol': {
			message: translate(
				'URLs with protocols can only start with http:// or https:// (e.g., https://example.com)'
			),
			messageString:
				'URLs with protocols can only start with http:// or https:// (e.g., https://example.com)',
		},
		default: {
			message: translate(
				'Please enter a valid website address (e.g., example.com). You can copy and paste.'
			),
			messageString:
				'Please enter a valid website address (e.g., example.com). You can copy and paste.',
		},
	};

	function getValidationMessage( url ) {
		const hasEnTranslationForAllMessages = Object.values( errorMessages ).every( ( message ) =>
			hasEnTranslation( message.messageString )
		);

		if ( ! hasEnTranslationForAllMessages ) {
			return translate( 'Please enter a valid website address. You can copy and paste.' );
		}

		const missingTLDRegex = /^(?:https?:\/\/)?(?!.*\.[a-z]{2,})([a-zA-Z0-9-_]+)$/;
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const invalidURLProtocolRegex = /^(?!https?:\/\/)\S+:\/\//;
		const invalidCharsRegex = /[^a-z0-9\-._~!$&'()*+,;:@/?=%[\]]/i;

		const removedInitialDots = url.replace( 'www.', '' );

		let errorMessage = errorMessages[ 'default' ].message;

		if ( emailRegex.test( url ) ) {
			errorMessage = errorMessages[ 'email' ].message;
		} else if ( invalidCharsRegex.test( url ) ) {
			errorMessage = errorMessages[ 'invalid-chars' ].message;
		} else if ( missingTLDRegex.test( removedInitialDots ) ) {
			errorMessage = errorMessages[ 'no-tld' ].message;
		} else if ( invalidURLProtocolRegex.test( url ) ) {
			errorMessage = errorMessages[ 'invalid-protocol' ].message;
		}

		return errorMessage;
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
					{ label ?? translate( 'Enter the URL of the site:' ) }
				</FormLabel>
				<FormTextInput
					id="capture-site-url"
					type="text"
					className={ clsx( { 'is-error': showValidationMsg } ) }
					// eslint-disable-next-line jsx-a11y/no-autofocus
					autoFocus
					autoComplete="off"
					autoCorrect="off"
					spellCheck="false"
					value={ urlValue }
					placeholder={ placeholder }
					onChange={ onChange }
				/>

				<FormSettingExplanation>
					<span className={ clsx( { 'is-error': showValidationMsg } ) }>
						{ showValidationMsg && (
							<>
								<Icon icon={ info } size={ 20 } /> { validationMessage }
							</>
						) }
					</span>
				</FormSettingExplanation>
			</FormFieldset>

			<NextButton type="submit">{ nextLabelText ?? translate( 'Continue' ) }</NextButton>

			<div className="action-buttons__importer-list">
				{ ! hideImporterListLink &&
					onDontHaveSiteAddressClick &&
					createInterpolateElement(
						dontHaveSiteAddressLabel ??
							translate( 'Or <button>choose a content platform</button>' ),
						{
							button: createElement( Button, {
								borderless: true,
								onClick: onDontHaveSiteAddressClick,
							} ),
						}
					) }
			</div>
		</form>
	);
};

export default CaptureInput;
