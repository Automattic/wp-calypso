/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Button } from '@automattic/components';
import { NextButton } from '@automattic/onboarding';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { Icon, info } from '@wordpress/icons';
import classnames from 'classnames';
import { localize, translate } from 'i18n-calypso';
import React, { ChangeEvent, FormEvent, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CAPTURE_URL_RGX } from 'calypso/blocks/import/util';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import type { OnInputChange, OnInputEnter } from './types';
import type { FunctionComponent } from 'react';

interface Props {
	translate: typeof translate;
	onInputEnter: OnInputEnter;
	onInputChange?: OnInputChange;
	onDontHaveSiteAddressClick?: () => void;
	hasError?: boolean;
}
const CaptureInput: FunctionComponent< Props > = ( props ) => {
	const { translate, onInputEnter, onInputChange, onDontHaveSiteAddressClick, hasError } = props;

	const [ urlValue, setUrlValue ] = useState( '' );
	const [ isValid, setIsValid ] = useState( false );
	const [ submitted, setSubmitted ] = useState( false );
	const exampleInputWebsite = 'artfulbaker.blog';
	const showValidationMsg = hasError || ( submitted && ! isValid );
	const { search } = useLocation();

	useEffect( () => checkInitSubmissionState(), [] );

	function checkInitSubmissionState() {
		const urlValue = new URLSearchParams( search ).get( 'from' ) || '';
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
		setUrlValue( e.target.value );
		validateUrl( e.target.value );
		onInputChange?.( e.target.value );
	}

	function onFormSubmit( e: FormEvent< HTMLFormElement > ) {
		e.preventDefault();
		isValid && onInputEnter( urlValue );
		setSubmitted( true );
	}

	return (
		<form className={ classnames( 'import-light__capture' ) } onSubmit={ onFormSubmit }>
			<FormFieldset>
				<FormLabel>{ translate( 'Enter the URL of the site:' ) }</FormLabel>
				<FormTextInput
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

export default localize( CaptureInput );
