/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Button } from '@automattic/components';
import { NextButton } from '@automattic/onboarding';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { Icon, info } from '@wordpress/icons';
import classnames from 'classnames';
import { localize, translate } from 'i18n-calypso';
import React, { ChangeEvent, useState } from 'react';
import { CAPTURE_URL_RGX } from 'calypso/blocks/import/util';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { bulb } from 'calypso/signup/icons';
import type { OnInputEnter } from './types';
import type { FunctionComponent } from 'react';

interface Props {
	translate: typeof translate;
	onInputEnter: OnInputEnter;
}
const CaptureInput: FunctionComponent< Props > = ( props ) => {
	const { translate, onInputEnter } = props;

	const [ urlValue, setUrlValue ] = useState( '' );
	const [ isValid, setIsValid ] = useState( true );
	const exampleInputWebsite = 'www.artfulbaker.blog';

	function validateUrl( url: string ) {
		return CAPTURE_URL_RGX.test( url );
	}

	function onInputBlur() {
		if ( ! urlValue ) return;

		setIsValid( validateUrl( urlValue ) );
	}

	function onInputChange( e: ChangeEvent< HTMLInputElement > ) {
		setUrlValue( e.target.value );
	}

	return (
		<div className={ classnames( 'import-light__capture' ) }>
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
					className={ classnames( { 'is-error': ! isValid } ) }
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
					onBlur={ onInputBlur }
					onChange={ onInputChange }
				/>
				<Button borderless={ true } className={ 'action-buttons__importer-list' }>
					{ translate( "Don't have a site address?" ) }
				</Button>
				<FormSettingExplanation>
					<span className={ classnames( { 'is-error': ! isValid } ) }>
						{ isValid && (
							<>
								<Icon icon={ bulb } size={ 20 } />{ ' ' }
								{ translate(
									'You must own this website. You can still skip this step to start fresh.'
								) }
							</>
						) }
						{ ! isValid && (
							<>
								<Icon icon={ info } size={ 20 } />{ ' ' }
								{ translate( 'Please enter a valid website address. You can copy and paste.' ) }
							</>
						) }
					</span>
				</FormSettingExplanation>
			</FormFieldset>

			<NextButton size={ 0 } disabled={ ! isValid } onClick={ () => onInputEnter( urlValue ) }>
				{ translate( 'Continue' ) }
			</NextButton>
		</div>
	);
};

export default localize( CaptureInput );
