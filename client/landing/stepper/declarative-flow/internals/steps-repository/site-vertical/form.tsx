import { Button } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import SelectVertical from 'calypso/components/select-vertical';
import { tip } from 'calypso/signup/icons';
import type { Vertical } from 'calypso/components/select-vertical/types';
import './form.scss';

interface Props {
	defaultVertical?: string;
	isSkipSynonyms?: boolean;
	isBusy?: boolean;
	siteID: number;
	onSelect?: ( vertical: Vertical ) => void;
	onSubmit?: ( event: React.FormEvent, userInput: string ) => void;
}

const SiteVerticalForm: React.FC< Props > = ( {
	defaultVertical,
	isSkipSynonyms,
	isBusy,
	siteID,
	onSelect,
	onSubmit,
} ) => {
	const translate = useTranslate();
	const [ userInput, setUserInput ] = React.useState( '' );

	const handleInputChange = ( value: string ) => {
		setUserInput( value );

		// Reset the vertical selection if input field is empty.
		// This is so users don't need to explicitly select "Something else" to clear previous selection.
		if ( value.trim().length === 0 ) {
			onSelect?.( { name: '', value: '', label: '' } );
		}
	};

	return (
		<form
			className="site-vertical__form"
			onSubmit={ ( event: React.FormEvent ) => {
				onSubmit?.( event, userInput );
			} }
		>
			<FormFieldset className="site-vertical__form-fieldset">
				<SelectVertical
					defaultVertical={ defaultVertical }
					isSkipSynonyms={ isSkipSynonyms }
					seed={ siteID }
					onInputChange={ handleInputChange }
					onSelect={ onSelect }
				/>
				<FormSettingExplanation>
					<Icon className="site-vertical__form-icon" icon={ tip } size={ 20 } />
					{ translate( 'We will use this information to guide you towards next steps.' ) }
				</FormSettingExplanation>
			</FormFieldset>
			<Button
				className="site-vertical__submit-button"
				type="submit"
				disabled={ isBusy }
				busy={ isBusy }
				primary
			>
				{ translate( 'Continue' ) }
			</Button>
		</form>
	);
};

export default SiteVerticalForm;
