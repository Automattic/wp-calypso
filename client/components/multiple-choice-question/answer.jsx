/**
 * External dependencies
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import FormTextInput from 'calypso/components/forms/form-text-input';

const MultipleChoiceAnswer = ( {
	disabled,
	answer: { id, answerText, textInput, textInputPrompt, children },
	isSelected,
	onAnswerChange,
	selectedAnswerText,
} ) => {
	const [ textResponse, setTextResponse ] = useState( selectedAnswerText );

	return (
		<FormLabel>
			<FormRadio
				value={ id }
				onChange={ () => {
					onAnswerChange( id, textResponse );
				} }
				checked={ isSelected }
				disabled={ disabled }
				label={ answerText }
			/>
			{ isSelected && (
				<div className="multiple-choice-question__answer-item-content">
					{ textInput && (
						<FormTextInput
							className="multiple-choice-question__answer-item-text-input"
							value={ textResponse }
							onChange={ ( { target: { value } } ) => {
								onAnswerChange( id, value );
								setTextResponse( value );
							} }
							placeholder={ textInputPrompt ? textInputPrompt : '' }
							disabled={ disabled }
						/>
					) }
					{ children }
				</div>
			) }
		</FormLabel>
	);
};

MultipleChoiceAnswer.propTypes = {
	disabled: PropTypes.bool,
	isSelected: PropTypes.bool,
	onAnswerChange: PropTypes.func,
	answer: PropTypes.shape( {
		id: PropTypes.string.isRequired,
		answerText: PropTypes.string.isRequired,
		textInput: PropTypes.bool,
		textInputPrompt: PropTypes.string,
		children: PropTypes.object,
	} ).isRequired,
	selectedAnswerText: PropTypes.string,
};

MultipleChoiceAnswer.defaultProps = {
	disabled: false,
	selectedAnswerText: '',
};

export default MultipleChoiceAnswer;
