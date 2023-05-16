import { useTranslate } from 'i18n-calypso';
import React, { useState } from 'react';
import FormSelect from 'calypso/components/forms/form-select';

export const CredentialsHelper = () => {
	const translate = useTranslate();

	const [ selectedProvider, setSelectedProvider ] = useState( 'godaddy' );

	const handleProviderChange = ( event: React.ChangeEvent< HTMLSelectElement > ) => {
		setSelectedProvider( event.target.value );
	};

	return (
		<>
			<h3>Do you need help locating your credentials?</h3>
			<p>Select your hosting and we'll help you find your server credentials.</p>
			<FormSelect
				name="provider"
				id="hosting-provider"
				value={ selectedProvider }
				onChange={ handleProviderChange }
				disabled={ false }
			>
				<option value="godaddy">{ translate( 'GoDaddy' ) }</option>
				<option value="aws">{ translate( 'AWS' ) }</option>
			</FormSelect>
			<p>Read through the GoDaddy support site to learn how to obtain your credentials.</p>
		</>
	);
};
