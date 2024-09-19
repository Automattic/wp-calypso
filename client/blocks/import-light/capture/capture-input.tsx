/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Button, FormLabel } from '@automattic/components';
import { NextButton } from '@automattic/onboarding';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { Icon, info } from '@wordpress/icons';
import clsx from 'clsx';
import { localize, translate } from 'i18n-calypso';
import React, { ChangeEvent, FormEvent, useState } from 'react';
import { CAPTURE_URL_RGX } from 'calypso/blocks/import/util';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { bulb } from 'calypso/signup/icons';
import type { OnInputEnter } from './types';
import type { FunctionComponent } from 'react';

interface Props {
	translate: typeof translate;
	onInputEnter: OnInputEnter;
	onDontHaveSiteAddressClick?: () => void;
}
const CaptureInput: FunctionComponent< Props > = ( props ) => {
	const { translate, onInputEnter, onDontHaveSiteAddressClick } = props;

	const [ urlValue, setUrlValue ] = useState( '' );
	const [ isValid, setIsValid ] = useState( false );
	const [ submitted, setSubmitted ] = useState( false );
	const exampleInputWebsite = 'www.artfulbaker.blog';
	const showValidationMsg = submitted && ! isValid;

	function validateUrl( url: string ) {
		const isValid = CAPTURE_URL_RGX.test( url );
		setIsValid( isValid );
	}

	function onInputChange( e: ChangeEvent< HTMLInputElement > ) {
		setUrlValue( e.target.value );
		validateUrl( e.target.value );
	}

	function onFormSubmit( e: FormEvent< HTMLFormElement > ) {
		e.preventDefault();
		isValid && onInputEnter( urlValue );
		setSubmitted( true );
	}

	return (
		<form className={ clsx( 'import-light__capture' ) } onSubmit={ onFormSubmit }>
			<FormFieldset>
				<FormLabel>
					{ createInterpolateElement(
						translate( 'Existing site address <span>(optional)</span>' ).toString(),
						{
							span: createElement( 'span' ),
						}
					) }
				</FormLabel>
				<FormTextInput
					type="text"
					className={ clsx( { 'is-error': showValidationMsg } ) }
					// eslint-disable-next-line jsx-a11y/no-autofocus
					autoFocus
					autoComplete="off"
					autoCorrect="off"
					spellCheck="false"
					value={ urlValue }
					placeholder={ sprintf(
						/* translators: the exampleSite is a URL, eg: www.artfulbaker.blog */
						translate( 'Ex. %(exampleSite)s' ).toString(),
						{
							exampleSite: exampleInputWebsite,
						}
					) }
					onChange={ onInputChange }
				/>
				<Button
					borderless
					className="action-buttons__importer-list"
					onClick={ onDontHaveSiteAddressClick }
				>
					{ translate( "Don't have a site address?" ) }
				</Button>
				<FormSettingExplanation>
					<span className={ clsx( { 'is-error': showValidationMsg } ) }>
						{ ! showValidationMsg && (
							<>
								<Icon icon={ bulb } size={ 20 } />{ ' ' }
								{ translate(
									'You must own this website. You can still skip this step to start fresh.'
								) }
							</>
						) }
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
		</form>
	);
};

export default localize( CaptureInput );
