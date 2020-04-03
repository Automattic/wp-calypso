/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { gaRecordEvent } from 'lib/analytics/ga';
import FormLabel from 'components/forms/form-label';
import FormInputValidation from 'components/forms/form-input-validation';
import FormSelect from 'components/forms/form-select';

class CountrySelect extends React.Component {
	recordCountrySelectClick = () => {
		if ( this.props.eventFormName ) {
			gaRecordEvent( 'Upgrades', `Clicked ${ this.props.eventFormName } Country Select` );
		}
	};

	render() {
		const { countriesList } = this.props;
		const classes = classNames( this.props.additionalClasses, 'country' );

		let options = [];
		let { value } = this.props;
		value = value || '';

		if ( isEmpty( countriesList ) ) {
			options.push( {
				key: 'loading',
				label: this.props.translate( 'Loading…' ),
			} );
		} else {
			options = options.concat( [
				{ key: 'select-country', label: this.props.translate( 'Select Country' ), value: '' },
				{ key: 'divider1', label: '', disabled: 'disabled', value: '-' },
			] );

			options = options.concat(
				countriesList.map( ( country, index ) => {
					if ( isEmpty( country.code ) ) {
						return { key: index, label: '', disabled: 'disabled', value: '-' };
					}

					return {
						key: index,
						label: country.name,
						value: country.code,
					};
				} )
			);
		}

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
						value={ value }
						disabled={ this.props.disabled }
						inputRef={ this.props.inputRef }
						onChange={ this.props.onChange }
						onClick={ this.recordCountrySelectClick }
						isError={ this.props.isError }
					>
						{ options.map( option => (
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

export default localize( CountrySelect );
