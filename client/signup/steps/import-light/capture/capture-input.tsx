import { NextButton } from '@automattic/onboarding';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { Icon } from '@wordpress/icons';
import classnames from 'classnames';
import { localize, translate } from 'i18n-calypso';
import React, { ChangeEvent, FormEvent, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { bulb } from 'calypso/signup/icons';
import { CAPTURE_URL_RGX } from 'calypso/signup/steps/import/util';
import type { FunctionComponent } from 'react';

interface Props {
	translate: typeof translate;
	onSubmit?: ( value: string ) => void;
}
const CaptureInput: FunctionComponent< Props > = ( props ) => {
	const { translate, onSubmit } = props;

	const [ urlValue, setUrlValue ] = useState( '' );
	const [ isValid, setIsValid ] = useState( true );

	function validateUrl( url: string ) {
		return CAPTURE_URL_RGX.test( url );
	}

	function onInputBlur() {
		setIsValid( validateUrl( urlValue ) );
	}

	function onInputChange( e: ChangeEvent< HTMLInputElement > ) {
		setUrlValue( e.target.value );
	}

	function onFormSubmit( e: FormEvent< HTMLFormElement > ) {
		e.preventDefault();

		isValid && onSubmit && onSubmit( urlValue );
	}

	return (
		<form className={ classnames( 'import-light__capture' ) } onSubmit={ onFormSubmit }>
			<FormFieldset>
				<FormLabel>
					{ createInterpolateElement(
						translate( 'Site address <span>(optional)</span>' ).toString(),
						{
							span: createElement( 'span' ),
						}
					) }
				</FormLabel>
				<FormTextInput
					type="text"
					// eslint-disable-next-line jsx-a11y/no-autofocus
					autoFocus
					autoComplete="off"
					autoCorrect="off"
					spellCheck="false"
					dir="ltr"
					value={ urlValue }
					onBlur={ onInputBlur }
					onChange={ onInputChange }
				/>
				<FormSettingExplanation>
					<span className={ classnames( { isError: ! isValid } ) }>
						{ isValid && (
							<>
								<Icon icon={ bulb } size={ 20 } />{ ' ' }
								{ translate( 'You can skip this step to start fresh.' ) }
							</>
						) }
						{ ! isValid && (
							<>{ translate( 'The address you entered is not valid. Please try again.' ) }</>
						) }
					</span>
				</FormSettingExplanation>
			</FormFieldset>

			<NextButton type={ 'submit' } disabled={ ! isValid || ! urlValue }>
				{ translate( 'Continue' ) }
			</NextButton>
		</form>
	);
};

export default localize( CaptureInput );
