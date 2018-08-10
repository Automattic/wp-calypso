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

	render() {
		const { id, title, description, value, placeholder, error, className, options } = this.props;

		return (
			<FormFieldset className={ className }>
				<FormLabel htmlFor={ id }>{ title }</FormLabel>
				<TokenField
					id={ id }
					name={ id }
					placeholder={ placeholder }
					value={ map( value, this.getNameFromId.bind( this ) ) }
					suggestions={ uniqBy( map( options, option => option.name ) ) }
					isError={ Boolean( error ) }
					onChange={ this.onChange.bind( this ) }
					displayTransform={ this.transformForDisplay.bind( this ) }
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

	getIdFromSlugOrName( slug ) {
		// Try a percise slug match first (if an item was clicked or Enter was pressed)
		let found = this.props.options.find( option => {
			return option.slug === slug;
		} );

		// If there are no precise matches, try guessing
		if ( ! found && slug.trim().length ) {
			found = this.props.options.find( option => {
				return 0 === option.name.toLowerCase().indexOf( slug.trim().toLowerCase() );
			} );
		}

		return found ? found.id : null;
	}

	transformForDisplay( token ) {
		const option = this.props.options.find( item => item.slug === token );

		return option ? option.name : token;
	}

	onChange( strings ) {
		const { updateValue } = this.props;

		const updatedValue = uniqBy(
			strings.map( this.getIdFromSlugOrName.bind( this ) ).filter( item => null !== item )
		);

		updateValue( updatedValue );
	}
}
