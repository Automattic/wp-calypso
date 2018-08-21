/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { uniqBy, map } from 'lodash';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import TokenField from 'components/token-field';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

export default class ShippingClassesField extends React.Component {
	static propTypes = {
		id: PropTypes.string.isRequired,
		title: PropTypes.string,
		description: PropTypes.string,
		value: PropTypes.array.isRequired,
		updateValue: PropTypes.func,
		options: PropTypes.array,
	};

	render() {
		const { id, title, description, value, placeholder, options } = this.props;

		// If there are no shipping classes, no input for them is needed.
		if ( false === options || 0 === options.length ) {
			return null;
		}

		return (
			<FormFieldset>
				<FormLabel htmlFor={ id }>{ title }</FormLabel>
				<TokenField
					id={ id }
					name={ id }
					placeholder={ placeholder }
					value={ this.prepareValueForTokenField( value ) }
					suggestions={ uniqBy( map( options, option => option.name ) ) }
					onChange={ this.onChange }
					displayTransform={ this.transformForDisplay }
				/>
				{ description && <FormSettingExplanation>{ description }</FormSettingExplanation> }
			</FormFieldset>
		);
	}

	prepareValueForTokenField = value => {
		return map( value, this.getNameFromId ).filter( selected => null !== selected );
	};

	getNameFromId = id => {
		const found = this.props.options.find( option => {
			return option.id === id;
		} );

		return found ? found.name : null;
	};

	getIdFromName = name => {
		const found = this.props.options.find( option => {
			return option.name.toLowerCase() === name.toLowerCase();
		} );

		return found ? found.id : null;
	};

	transformForDisplay = token => {
		const option = this.props.options.find( item => item.slug === token );

		return option ? option.name : token;
	};

	onChange = strings => {
		const { updateValue } = this.props;

		const updatedValue = uniqBy(
			strings.map( this.getIdFromName ).filter( item => null !== item )
		);

		updateValue( updatedValue );
	};
}
