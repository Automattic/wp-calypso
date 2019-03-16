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

const MultipleChoiceAnswer = ( {
	answerText,
	disabled,
	children,
	id,
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
				disabled={ disabled }
			/>
			<span>{ answerText }</span>
			{ isSelected && (
				<div className="multiple-choice-question__answer-item-content">
					{ Children.map( children, child => {
						if ( MultipleChoiceAnswerTextInput === child.type ) {
							return cloneElement( child, {
								disabled,
								onTextChange: newText => {
									onAnswerChange( id, newText );
									setTextResponse( newText );
								},
								value: textResponse,
							} );
						}
						return cloneElement( child, {
							disabled,
						} );
					} ) }
				</div>
			) }
		</FormLabel>
	);
};

MultipleChoiceAnswer.propTypes = {
	answerText: PropTypes.string.isRequired,
	disabled: PropTypes.bool,
	doNotShuffle: PropTypes.bool,
	id: PropTypes.string.isRequired,
	isSelected: PropTypes.bool,
	onAnswerChange: PropTypes.func,
	textInput: PropTypes.bool,
	textInputPrompt: PropTypes.string,
};

MultipleChoiceAnswer.defaultProps = {
	disabled: false,
};

export default MultipleChoiceAnswer;
