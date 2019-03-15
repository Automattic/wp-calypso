/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */

import FormTextInput from 'components/forms/form-text-input';

const MultipleChoiceAnswerTextInput = ( { prompt, value, onTextChange } ) => {
	return (
		<FormTextInput
			value={ value }
			onChange={ ( { target: { value: newText } } ) => {
				onTextChange( newText );
			} }
			placeholder={ prompt }
		/>
	);
};

MultipleChoiceAnswerTextInput.propTypes = {
	onTextChange: PropTypes.func,
	value: PropTypes.string,
	prompt: PropTypes.string,
};

MultipleChoiceAnswerTextInput.defaultProps = {
	prompt: '',
};

export default MultipleChoiceAnswerTextInput;
