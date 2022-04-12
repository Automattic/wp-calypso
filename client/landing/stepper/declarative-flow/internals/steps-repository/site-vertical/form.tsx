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
	isSkipSynonyms?: boolean;
	onSelect?: ( vertical: Vertical ) => void;
	onSubmit?: ( event: React.FormEvent ) => void;
}

const SiteVerticalForm: React.FC< Props > = ( { isSkipSynonyms, onSelect, onSubmit } ) => {
	const translate = useTranslate();

	return (
		<form className="site-vertical__form" onSubmit={ onSubmit }>
			<FormFieldset className="site-vertical__form-fieldset">
				<SelectVertical isSkipSynonyms={ isSkipSynonyms } onSelect={ onSelect } />
				<FormSettingExplanation>
					<Icon className="site-vertical__form-icon" icon={ tip } size={ 20 } />
					{ translate( 'We will use this information to guide you towards next steps.' ) }
				</FormSettingExplanation>
			</FormFieldset>
			<Button className="site-vertical__submit-button" type="submit" primary>
				{ translate( 'Continue' ) }
			</Button>
		</form>
	);
};

export default SiteVerticalForm;
