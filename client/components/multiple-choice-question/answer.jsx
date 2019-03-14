/** @format */

/**
 * External dependencies
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormTextInput from 'components/forms/form-text-input';

const MultipleChoiceAnswer = ( {
	answerText,
	children,
	id,
	isSelected,
	onAnswerChange,
	textInput,
	textInputPrompt,
} ) => {
	const [ textResponse, setTextResponse ] = useState( '' );

	return (
		<FormLabel>
			<FormRadio
				value={ id }
				onChange={ () => {
					onAnswerChange( id, textResponse );
				} }
				checked={ isSelected }
			/>
			<span>{ answerText }</span>
			{ isSelected && (
				<div className="multiple-choice-question__answer-item-content">
					{ textInput && (
						<FormTextInput
							value={ textResponse }
							onChange={ ( { target: { value } } ) => {
								onAnswerChange( id, value );
								setTextResponse( value );
							} }
							placeholder={ textInputPrompt ? textInputPrompt : '' }
						/>
					) }
					{ children }
				</div>
			) }
		</FormLabel>
	);
};

MultipleChoiceAnswer.propTypes = {
	answerText: PropTypes.string.isRequired,
	doNotShuffle: PropTypes.bool,
	id: PropTypes.string.isRequired,
	isSelected: PropTypes.bool,
	onAnswerChange: PropTypes.func,
	textInput: PropTypes.bool,
	textInputPrompt: PropTypes.string,
};

export default MultipleChoiceAnswer;
