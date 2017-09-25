/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import React from 'react';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import analytics from 'lib/analytics';
import observe from 'lib/mixins/data-observe';
import scrollIntoViewport from 'lib/scroll-into-viewport';

export default localize( React.createClass( {
	displayName: 'CountrySelect',

	mixins: [ observe( 'countriesList' ) ],

	recordCountrySelectClick() {
		if ( this.props.eventFormName ) {
			analytics.ga.recordEvent( 'Upgrades', `Clicked ${ this.props.eventFormName } Country Select` );
		}
	},

	focus() {
		const node = ReactDom.findDOMNode( this.refs.input );
		node.focus();
		scrollIntoViewport( node );
	},

	render() {
		const classes = classNames( this.props.additionalClasses, 'country' );
		const countriesList = this.props.countriesList.get();
		let options = [];
		let { value } = this.props;
		value = value || '';

		if ( isEmpty( countriesList ) ) {
			options.push( { key: 'loading', label: this.props.translate( 'Loading…' ), disabled: 'disabled' } );
		} else {
			options = options.concat( [
				{ key: 'select-country', label: this.props.translate( 'Select Country' ), value: '' },
				{ key: 'divider1', label: '', disabled: 'disabled', value: '-' }
			] );

			options = options.concat( countriesList.map( ( country, index ) => {
				if ( isEmpty( country.code ) ) {
					return { key: 'divider2', label: '', disabled: 'disabled', value: '-' };
				}

				return { key: `country-select-${ index }-${ country.code }`, label: country.name, value: country.code };
			} ) );
		}

		return (
			<div className={ classes }>
				<div>
					<FormLabel htmlFor={ this.props.name }>{ this.props.label }</FormLabel>

					<FormSelect
						name={ this.props.name }
						value={ value }
						disabled={ this.props.disabled }
						ref="input"
						onChange={ this.props.onChange }
						onClick={ this.recordCountrySelectClick }
						isError={ this.props.isError }>
						{ options.map( option => (
							<option
								key={ option.key }
								value={ option.value }
								disabled={ option.disabled }
							>
								{ option.label }
							</option>
						) ) }
					</FormSelect>
				</div>

				{ this.props.errorMessage && <FormInputValidation text={ this.props.errorMessage } isError /> }
			</div>
		);
	}
} ) );
