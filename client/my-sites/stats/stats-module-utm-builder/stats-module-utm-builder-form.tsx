import { FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect, useRef, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import StatsButton from '../components/stats-button';

import './style.scss';

type InputFieldProps = {
	id: string;
	label: string;
	name: string;
	placeholder: string;
	value: string;
	onChange: ( e: React.ChangeEvent< HTMLInputElement > ) => void;
	inputReference?: React.RefObject< HTMLInputElement >;
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
	inputReference,
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
				inputRef={ inputReference }
			/>
		</div>
	);
};

const UtmBuilder: React.FC = () => {
	const translate = useTranslate();
	const [ url, setUrl ] = useState( '' );
	const [ inputValues, setInputValues ] = useState< inputValuesType >( {
		utm_source: '',
		utm_medium: '',
		utm_campaign: '',
	} );
	// Focus the initial input field when rendered.
	const initialInputReference = useRef< HTMLInputElement >( null );

	useEffect( () => {
		initialInputReference.current!.focus();
	}, [] );

	const fromLabels: formLabelsType = {
		url: {
			label: translate( 'Site or post URL' ),
			placeholder: '',
		},
		utm_source: { label: translate( 'UTM source' ), placeholder: translate( 'e.g. newsletter' ) },
		utm_medium: {
			label: translate( 'UTM medium' ),
			placeholder: translate( 'e.g. email, social' ),
		},
		utm_campaign: {
			label: translate( 'UTM campaign' ),
			placeholder: translate( 'e.g. promotion' ),
		},
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
		.map( ( [ key, value ] ) => ( value ? `${ key }=${ encodeURIComponent( value ) }` : '' ) )
		.filter( ( value ) => value.length )
		.join( '&' );

	const utmString = ! url
		? translate( 'Fill out campaign parameters to see the URL' )
		: `${ url }${
				campaignString ? `${ url.includes( '?' ) ? '&' : '?' }${ campaignString }` : ''
		  }`;

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
						inputReference={ initialInputReference }
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

			<div>
				<div className="stats-utm-builder__label">{ translate( 'Your URL to share' ) }</div>
				<div className="stats-utm-builder__url">{ utmString }</div>
			</div>
			<StatsButton
				primary
				onClick={ () => {
					navigator.clipboard.writeText( utmString );
				} }
			>
				{ translate( 'Copy to clipboard' ) }
			</StatsButton>
		</>
	);
};

export default UtmBuilder;
