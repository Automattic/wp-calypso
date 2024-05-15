import { Button, FormInputValidation, FormLabel } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import { localize, LocalizeProps } from 'i18n-calypso';
import React, { useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import { tip } from '../../icons';
import type { SiteOptionsFormValues } from './types';
import type { TranslateResult } from 'i18n-calypso';
import './site-options.scss';

interface Props {
	defaultSiteTitle: string;
	defaultTagline: string;
	defaultSearchTerms?: string;
	siteTitleLabel: TranslateResult;
	siteTitleExplanation?: TranslateResult;
	taglineExplanation?: TranslateResult;
	searchTermsExplanation?: TranslateResult;
	isSiteTitleRequired?: boolean;
	isTaglineRequired?: boolean;
	acceptSearchTerms?: boolean;
	onSubmit: ( siteOptionsFormValues: SiteOptionsFormValues ) => void;
	translate: LocalizeProps[ 'translate' ];
}

const SiteOptions: React.FC< Props > = ( {
	defaultSiteTitle = '',
	defaultTagline = '',
	defaultSearchTerms = '',
	siteTitleLabel,
	siteTitleExplanation,
	searchTermsExplanation,
	taglineExplanation,
	isSiteTitleRequired,
	isTaglineRequired,
	acceptSearchTerms,
	onSubmit,
	translate,
} ) => {
	const [ formValues, setFormValues ] = React.useState( {
		siteTitle: defaultSiteTitle,
		tagline: defaultTagline,
		searchTerms: defaultSearchTerms,
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
					isError={ Boolean( siteTitleError ) }
					onChange={ onChange }
				/>
				{ siteTitleError && <FormInputValidation isError text={ siteTitleError } /> }
				{ siteTitleExplanation && (
					<FormSettingExplanation>
						<Icon className="site-options__form-icon" icon={ tip } size={ 20 } />
						{ siteTitleExplanation }
					</FormSettingExplanation>
				) }
			</FormFieldset>
			<FormFieldset className="site-options__form-fieldset">
				<FormLabel htmlFor="tagline" optional={ ! isTaglineRequired }>
					{ translate( 'Tagline' ) }
				</FormLabel>
				<FormInput
					name="tagline"
					id="tagline"
					value={ formValues.tagline }
					isError={ Boolean( taglineError ) }
					onChange={ onChange }
				/>
				{ taglineError && <FormInputValidation isError text={ taglineError } /> }
				{ taglineExplanation && (
					<FormSettingExplanation>
						<Icon className="site-options__form-icon" icon={ tip } size={ 20 } />
						{ taglineExplanation }
					</FormSettingExplanation>
				) }
			</FormFieldset>
			{ acceptSearchTerms && (
				<FormFieldset className="site-options__form-fieldset">
					<FormLabel htmlFor="searchTerms" optional>
						{ translate( 'Search terms' ) }
					</FormLabel>
					<FormInput
						name="searchTerms"
						id="searchTerms"
						value={ formValues.searchTerms }
						onChange={ onChange }
					/>
					{ searchTermsExplanation && (
						<FormSettingExplanation>
							<Icon className="site-options__form-icon" icon={ tip } size={ 20 } />
							{ searchTermsExplanation }
						</FormSettingExplanation>
					) }
				</FormFieldset>
			) }
			<Button className="site-options__submit-button" type="submit" primary>
				{ translate( 'Continue' ) }
			</Button>
		</form>
	);
};

export default localize( SiteOptions );
