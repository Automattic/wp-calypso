import { NextButton } from '@automattic/onboarding';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { Icon } from '@wordpress/icons';
import classnames from 'classnames';
import { localize, translate } from 'i18n-calypso';
import React, { useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { bulb } from 'calypso/signup/icons';
import type { FunctionComponent } from 'react';

interface Props {
	translate: typeof translate;
}
const CaptureInput: FunctionComponent< Props > = ( props ) => {
	const { translate } = props;

	const [ isValid ] = useState( true );

	return (
		<div className={ classnames( 'import-light__capture' ) }>
			<FormFieldset>
				<FormLabel>
					{ createInterpolateElement(
						translate( 'Site address <span>(optional)</span>' ).toString(),
						{
							span: createElement( 'span' ),
						}
					) }
				</FormLabel>
				<FormTextInput type="text" />
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

			<NextButton size={ 0 }>{ translate( 'Continue' ) }</NextButton>
		</div>
	);
};

export default localize( CaptureInput );
