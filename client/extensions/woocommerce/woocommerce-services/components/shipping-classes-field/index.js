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
import FieldError from '../field-error';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

export default class ShippingClassesField extends React.Component {
	static propTypes = {
		id: PropTypes.string.isRequired,
		title: PropTypes.string,
		description: PropTypes.string,
		value: PropTypes.array.isRequired,
		updateValue: PropTypes.func,
		error: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
		className: PropTypes.string,
		options: PropTypes.array,
	};

	constructor() {
		super( ...arguments );

		this.getNameFromId = this.getNameFromId.bind( this );
		this.onChange = this.onChange.bind( this );
		this.transformForDisplay = this.transformForDisplay.bind( this );
		this.getIdFromName = this.getIdFromName.bind( this );
	}

	render() {
		const { id, title, description, value, placeholder, error, className, options } = this.props;

		// If there are no shipping classes, no input for them is needed.
		if ( false === options || 0 === options.length ) {
			return null;
		}

		return (
			<FormFieldset className={ className }>
				<FormLabel htmlFor={ id }>{ title }</FormLabel>
				<TokenField
					id={ id }
					name={ id }
					placeholder={ placeholder }
					value={ map( value, this.getNameFromId ) }
					suggestions={ uniqBy( map( options, option => option.name ) ) }
					isError={ Boolean( error ) }
					onChange={ this.onChange }
					displayTransform={ this.transformForDisplay }
				/>
				{ error && typeof error === 'string' && <FieldError text={ error } /> }
				{ ! error &&
					description && <FormSettingExplanation>{ description }</FormSettingExplanation> }
			</FormFieldset>
		);
	}

	getNameFromId( id ) {
		const found = this.props.options.find( option => {
			return option.id === id;
		} );

		return found ? found.name : null;
	}

	getIdFromName( name ) {
		const found = this.props.options.find( option => {
			return option.name.toLowerCase() === name.toLowerCase();
		} );

		return found ? found.id : null;
	}

	transformForDisplay( token ) {
		const option = this.props.options.find( item => item.slug === token );

		return option ? option.name : token;
	}

	onChange( strings ) {
		const { updateValue } = this.props;

		const updatedValue = uniqBy(
			strings.map( this.getIdFromName ).filter( item => null !== item )
		);

		updateValue( updatedValue );
	}
}
