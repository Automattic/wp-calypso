/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { map, forEach } from 'lodash';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormToggleInput from 'components/token-field';
import FieldError from '../field-error';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

export default class TokenField extends React.Component {
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
				<FormToggleInput
					id={ id }
					name={ id }
					placeholder={ placeholder }
					value={ value.map( selected => selected + '' ) }
					suggestions={ map( options, option => option.id + '' ) }
					isError={ Boolean( error ) }
					onChange={ this.onChange.bind( this ) }
					saveTransform={ this.saveTransform.bind( this ) }
					displayTransform={ this.transformForDisplay.bind( this ) }
				/>
				{ error && typeof error === 'string' && <FieldError text={ error } /> }
				{ ! error &&
					description && <FormSettingExplanation>{ description }</FormSettingExplanation> }
			</FormFieldset>
		);
	}

	saveTransform( token ) {
		const { options } = this.props;

		let result = '';

		forEach( options, option => {
			if ( option.name.toLowerCase() === token.toLowerCase().trim() ) {
				result = option.id + '';
			}
		} );

		return result;
	}

	transformForDisplay( token ) {
		const { options } = this.props;
		const option = options.find( item => item.id === parseInt( token ) );
		return option ? option.name : token;
	}

	onChange( strings ) {
		const { updateValue } = this.props;
		updateValue( strings.map( selected => parseInt( selected ) ) );
	}
}
