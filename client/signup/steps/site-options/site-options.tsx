import { Button } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import { localize, LocalizeProps } from 'i18n-calypso';
import React from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import { tip } from './icons';
import './site-options.scss';

interface FormElements extends HTMLFormControlsCollection {
	siteTitle: HTMLInputElement;
	tagline: HTMLInputElement;
}

interface SiteOptionFormElement extends HTMLFormElement {
	readonly elements: FormElements;
}

interface Props {
	defaultSiteTitle: string;
	defaultTagline: string;
	onSubmit: ( siteTitle: string, tagline: string ) => void;
	translate: LocalizeProps[ 'translate' ];
}

const SiteOptions: React.FC< Props > = ( {
	defaultSiteTitle,
	defaultTagline,
	onSubmit,
	translate,
} ) => {
	const handleSubmit = ( event: React.FormEvent< SiteOptionFormElement > ) => {
		event.preventDefault();
		const { siteTitle, tagline } = event.currentTarget.elements;
		onSubmit( siteTitle.value, tagline.value );
	};

	return (
		<form className="site-options__form" onSubmit={ handleSubmit }>
			<FormFieldset className="site-options__form-fieldset">
				<FormLabel htmlFor="siteTitle" optional>
					{ translate( 'Blog name' ) }
				</FormLabel>
				<FormInput name="siteTitle" id="siteTitle" value={ defaultSiteTitle } />
			</FormFieldset>
			<FormFieldset className="site-options__form-fieldset">
				<FormLabel htmlFor="tagline" optional>
					{ translate( 'Tagline' ) }
				</FormLabel>
				<FormInput name="tagline" id="tagline" value={ defaultTagline } />
				<FormSettingExplanation>
					<Icon icon={ tip } size={ 20 } />
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
