import { Button } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import { localize, LocalizeProps } from 'i18n-calypso';
import React, { ReactChild, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import { tip } from '../../icons';
import type { SiteOptionsFormValues } from './types';
import type { TranslateResult } from 'i18n-calypso';
import './site-options.scss';

interface Props {
	defaultSiteTitle: string;
	defaultTagline: string;
	siteTitleLabel: ReactChild;
	taglineExplanation: ReactChild;
	isSiteTitleRequired?: boolean;
	isTaglineRequired?: boolean;
	onSubmit: ( siteOptionsFormValues: SiteOptionsFormValues ) => void;
	translate: LocalizeProps[ 'translate' ];
}

const SiteOptions: React.FC< Props > = ( {
	defaultSiteTitle = '',
	defaultTagline = '',
	siteTitleLabel,
	taglineExplanation,
	isSiteTitleRequired,
	isTaglineRequired,
	onSubmit,
	translate,
} ) => {
	const [ formValues, setFormValues ] = React.useState( {
		siteTitle: defaultSiteTitle,
		tagline: defaultTagline,
	} );

	const [ siteTitleError, setSiteTitleError ] = useState< TranslateResult | null >( null );
	const [ taglineError, setTaglineError ] = useState< TranslateResult | null >( null );

	const onChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		setFormValues( ( value ) => ( {
			...value,
			[ event.target.name ]: event.target.value,
		} ) );
		setSiteTitleError( null );
		setTaglineError( null );
	};

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();
		if ( isSiteTitleRequired && ! formValues.siteTitle?.trim().length ) {
			setSiteTitleError( translate( 'A valid site title is required.' ) );
			return;
		}
		if ( isTaglineRequired && ! formValues.tagline?.trim().length ) {
			setTaglineError( translate( 'A valid tagline is required.' ) );
			return;
		}
		onSubmit( formValues );
	};

	return (
		<form className="site-options__form" onSubmit={ handleSubmit }>
			<FormFieldset className="site-options__form-fieldset">
				<FormLabel htmlFor="siteTitle" optional={ ! isSiteTitleRequired }>
					{ siteTitleLabel }
				</FormLabel>
				<FormInput
					name="siteTitle"
					id="siteTitle"
					value={ formValues.siteTitle }
					onChange={ onChange }
				/>
				{ siteTitleError && <FormInputValidation isError text={ siteTitleError } /> }
			</FormFieldset>
			<FormFieldset className="site-options__form-fieldset">
				<FormLabel htmlFor="tagline" optional={ ! isTaglineRequired }>
					{ translate( 'Tagline' ) }
				</FormLabel>
				<FormInput name="tagline" id="tagline" value={ formValues.tagline } onChange={ onChange } />
				{ taglineError && <FormInputValidation isError text={ taglineError } /> }
				<FormSettingExplanation>
					<Icon className="site-options__form-icon" icon={ tip } size={ 20 } />
					{ taglineExplanation }
				</FormSettingExplanation>
			</FormFieldset>
			<Button className="site-options__submit-button" type="submit" primary>
				{ translate( 'Continue' ) }
			</Button>
		</form>
	);
};

export default localize( SiteOptions );
