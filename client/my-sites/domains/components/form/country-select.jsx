/**
 * External dependencies
 */

import React from 'react';
import { localize, translate } from 'i18n-calypso';
import classNames from 'classnames';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import FormLabel from 'calypso/components/forms/form-label';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormSelect from 'calypso/components/forms/form-select';

class CountrySelect extends React.PureComponent {
	recordCountrySelectClick = () => {
		if ( this.props.eventFormName ) {
			gaRecordEvent( 'Upgrades', `Clicked ${ this.props.eventFormName } Country Select` );
		}
	};

	render() {
		const { countriesList, value, additionalClasses } = this.props;
		const classes = classNames( additionalClasses, 'country' );
		const options = getOptionsFromCountriesList( countriesList );

		const validationId = `validation-field-${ this.props.name }`;

		return (
			<div className={ classes }>
				<div>
					<FormLabel htmlFor={ this.props.name }>{ this.props.label }</FormLabel>

					<FormSelect
						aria-invalid={ this.props.isError }
						aria-describedby={ validationId }
						name={ this.props.name }
						id={ this.props.name }
						value={ value || '' }
						disabled={ this.props.disabled }
						inputRef={ this.props.inputRef }
						onChange={ this.props.onChange }
						onClick={ this.recordCountrySelectClick }
						isError={ this.props.isError }
					>
						{ options.map( ( option ) => (
							<option key={ option.key } value={ option.value } disabled={ option.disabled }>
								{ option.label }
							</option>
						) ) }
					</FormSelect>
				</div>

				{ this.props.errorMessage && (
					<FormInputValidation id={ validationId } text={ this.props.errorMessage } isError />
				) }
			</div>
		);
	}
}

function getOptionsFromCountriesList( countriesList ) {
	if ( isEmpty( countriesList ) ) {
		return [
			{
				key: 'loading',
				label: translate( 'Loading…' ),
			},
		];
	}

	const initialOptions = [
		{ key: 'select-country', label: translate( 'Select Country' ), value: '' },
		{ key: 'divider1', label: '', disabled: 'disabled', value: '-' },
	];

	const countryOptions = countriesList.reduce( ( collected, country, index ) => {
		if ( isEmpty( country.code ) ) {
			return [
				...collected,
				{ key: `inner-divider${ index }`, label: '', disabled: 'disabled', value: '-' },
			];
		}

		const duplicates = collected.filter( ( prevCountry ) => prevCountry.value === country.code );

		return [
			...collected,
			{
				key: `${ country.code }-${ duplicates.length }`,
				label: country.name,
				value: country.code,
			},
		];
	}, [] );

	return [ ...initialOptions, ...countryOptions ];
}

export default localize( CountrySelect );
