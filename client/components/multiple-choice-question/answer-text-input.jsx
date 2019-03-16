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

const MultipleChoiceAnswerTextInput = ( { disabled, onTextChange, prompt, value } ) => {
	return (
		<FormTextInput
			value={ value }
			onChange={ ( { target: { value: newText } } ) => {
				onTextChange( newText );
			} }
			placeholder={ prompt }
			disabled={ disabled }
		/>
	);
};

MultipleChoiceAnswerTextInput.propTypes = {
	disabled: PropTypes.bool,
	onTextChange: PropTypes.func,
	prompt: PropTypes.string,
	value: PropTypes.string,
};

MultipleChoiceAnswerTextInput.defaultProps = {
	disabled: false,
	prompt: '',
};

export default MultipleChoiceAnswerTextInput;
