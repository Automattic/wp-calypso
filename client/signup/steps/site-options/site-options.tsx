import { Button } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import { localize, LocalizeProps } from 'i18n-calypso';
import React from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import { tip } from './icons';
import type { SiteOptionsFormValues } from './types';
import './site-options.scss';

interface Props {
	defaultSiteTitle: string;
	defaultTagline: string;
	onSubmit: ( siteOptionsFormValues: SiteOptionsFormValues ) => void;
	translate: LocalizeProps[ 'translate' ];
}

const SiteOptions: React.FC< Props > = ( {
	defaultSiteTitle = '',
	defaultTagline = '',
	onSubmit,
	translate,
} ) => {
	const [ formValues, setFormValues ] = React.useState( {
		siteTitle: defaultSiteTitle,
		tagline: defaultTagline,
	} );

	const onChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		setFormValues( ( value ) => ( {
			...value,
			[ event.target.name ]: event.target.value,
		} ) );
	};

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();
		onSubmit( formValues );
	};

	return (
		<form className="site-options__form" onSubmit={ handleSubmit }>
			<FormFieldset className="site-options__form-fieldset">
				<FormLabel htmlFor="siteTitle" optional>
					{ translate( 'Blog name' ) }
				</FormLabel>
				<FormInput
					name="siteTitle"
					id="siteTitle"
					value={ formValues.siteTitle }
					onChange={ onChange }
				/>
			</FormFieldset>
			<FormFieldset className="site-options__form-fieldset">
				<FormLabel htmlFor="tagline" optional>
					{ translate( 'Tagline' ) }
				</FormLabel>
				<FormInput name="tagline" id="tagline" value={ formValues.tagline } onChange={ onChange } />
				<FormSettingExplanation>
					<Icon className="site-options__form-icon" icon={ tip } size={ 20 } />
					{ translate( 'In a few words, explain what your blog is about.' ) }
				</FormSettingExplanation>
			</FormFieldset>
			<Button className="site-options__submit-button" type="submit" primary>
				{ translate( 'Continue' ) }
			</Button>
		</form>
	);
};

export default localize( SiteOptions );
