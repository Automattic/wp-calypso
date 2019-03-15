/** @format */

/**
 * External dependencies
 */
import React, { Children, cloneElement, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import MultipleChoiceAnswerTextInput from './answer-text-input';

const MultipleChoiceAnswer = ( { answerText, children, id, isSelected, onAnswerChange } ) => {
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
					{ Children.map( children, child => {
						if ( MultipleChoiceAnswerTextInput === child.type ) {
							return cloneElement( child, {
								value: textResponse,
								onTextChange: newText => {
									onAnswerChange( id, newText );
									setTextResponse( newText );
								},
							} );
						}
						return child;
					} ) }
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
