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

const AnswerItem = ( {
	answer: { id, answerText, textInput, textInputPrompt },
	isSelected,
	onAnswerChange,
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
			{ isSelected && textInput ? (
				<FormTextInput
					className="multiple-choice-question__answer-item-text-input"
					value={ textResponse }
					onChange={ ( { target: { value } } ) => {
						onAnswerChange( id, value );
						setTextResponse( value );
					} }
					placeholder={ textInputPrompt ? textInputPrompt : '' }
				/>
			) : null }
		</FormLabel>
	);
};

AnswerItem.propTypes = {
	answer: PropTypes.shape( {
		id: PropTypes.string.isRequired,
		answerText: PropTypes.string.isRequired,
		doNotShuffle: PropTypes.bool,
		textInput: PropTypes.bool,
		textInputPrompt: PropTypes.string,
	} ),
	isSelected: PropTypes.bool.isRequired,
};

export default AnswerItem;
