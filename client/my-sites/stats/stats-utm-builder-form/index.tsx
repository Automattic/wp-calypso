import { FormLabel } from '@automattic/components';
import { Button } from '@wordpress/components';
// import { useTranslate } from 'i18n-calypso';
import React, { useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';

import './style.scss';

type InputFieldProps = {
	id: string;
	label: string;
	name: string;
	placeholder: string;
	value: string;
	onChange: ( e: React.ChangeEvent< HTMLInputElement > ) => void;
};

const utmKeys = [ 'url', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term' ];

type UtmKeyType = ( typeof utmKeys )[ number ];

type inputValuesType = Record< UtmKeyType, string >;
type formLabelsType = Record< UtmKeyType, { label: string; placeholder: string } >;

const InputField: React.FC< InputFieldProps > = ( {
	id,
	label,
	name,
	placeholder,
	value,
	onChange,
} ) => {
	return (
		<div className="stats-utm-builder__form-field">
			<FormLabel htmlFor={ id }>{ label }</FormLabel>
			<FormTextInput
				type="text"
				id={ id }
				name={ name }
				value={ value }
				onChange={ onChange }
				placeholder={ placeholder }
			/>
		</div>
	);
};

const UtmBuilder: React.FC = () => {
	const [ url, setUrl ] = useState( '' );
	const [ inputValues, setInputValues ] = useState< inputValuesType >( {
		utm_source: '',
		utm_medium: '',
		utm_campaign: '',
	} );

	const fromLabels: formLabelsType = {
		url: {
			label: 'Website URL',
			placeholder: '',
		},
		utm_source: { label: 'UTM source (utm_source)', placeholder: 'e.g. newsletter' },
		utm_medium: { label: 'UTM medium (utm_medium)', placeholder: 'e.g. email, social' },
		utm_campaign: { label: 'UTM campaign (utm_campaign)', placeholder: 'e.g. promotion' },
	};

	const handleInputChange = ( e: React.ChangeEvent< HTMLInputElement > ) => {
		const { name, value } = e.target;
		setInputValues( ( prevValues ) => ( {
			...prevValues,
			[ name ]: value,
		} ) );
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		// Prevent submittin the form
		e.preventDefault();
	};

	const campaignString = Object.entries( inputValues )
		.map( ( [ key, value ] ) => ( value ? `${ key }=${ value }` : '' ) )
		.filter( ( value ) => value.length )
		.join( '&' );

	const utmString = `${ url }/?${ campaignString }`;

	return (
		<>
			<form onSubmit={ handleSubmit }>
				<FormFieldset>
					<InputField
						id="url"
						name="url"
						label={ fromLabels.url.label }
						placeholder={ fromLabels.url.placeholder }
						value={ url }
						onChange={ ( e ) => setUrl( e.target.value ) }
					/>
					{ Object.keys( inputValues ).map( ( key ) => (
						<InputField
							key={ key }
							id={ key }
							name={ key }
							label={ fromLabels[ key ].label }
							placeholder={ fromLabels[ key ].placeholder }
							value={ inputValues[ key ] }
							onChange={ handleInputChange }
						/>
					) ) }
				</FormFieldset>
			</form>

			{ url && (
				<>
					<div>
						<h2>Generated UTM string:</h2>
						<span>{ utmString }</span>
					</div>
					<div>
						<Button
							onClick={ () => {
								navigator.clipboard.writeText( utmString );
							} }
						>
							Copy to Clipboard
						</Button>
					</div>
				</>
			) }
		</>
	);
};

export default UtmBuilder;
