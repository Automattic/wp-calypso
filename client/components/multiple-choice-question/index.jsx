/** @format */

/**
 * External dependencies
 */
import React, { Children, cloneElement, useState } from 'react';
import { memoize, pick, shuffle, values } from 'lodash';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import MultipleChoiceAnswer from './answer';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';

/**
 * Style dependencies
 */
import './style.scss';

const shuffleAnswers = memoize(
	answers => {
		const shuffles = shuffle( answers.filter( ( { props: { doNotShuffle } } ) => ! doNotShuffle ) );
		return answers.map( answer => ( answer.props.doNotShuffle ? answer : shuffles.pop() ) );
	},
	answers =>
		answers
			.map( answer => values( pick( answer.props, 'id', 'doNotShuffle' ) ).join( '_' ) )
			.join( '-' )
);

const MultipleChoiceQuestion = ( { children, onAnswerChange, question } ) => {
	const [ selectedAnswer, setSelectedAnswer ] = useState( null );
	const shuffledChildren = shuffleAnswers( children );

	return (
		<FormFieldset className="multiple-choice-question">
			<FormLegend>{ question }</FormLegend>
			{ Children.map( shuffledChildren, child =>
				cloneElement( child, {
					key: child.props.id,
					isSelected: child.props.id && selectedAnswer === child.props.id,
					onAnswerChange: ( id, textResponse ) => {
						onAnswerChange( id, textResponse );
						setSelectedAnswer( id );
					},
				} )
			) }
		</FormFieldset>
	);
};

const checkChildrenAreOnlyAnswers = ( props, propName, componentName ) => {
	const prop = props[ propName ];

	let error = null;
	Children.forEach( prop, child => {
		if ( MultipleChoiceAnswer !== child.type ) {
			error = new Error(
				`${ componentName } should only have children of type MultipleChoiceAnswer. One is of type ${
					child.type
				}`
			);
		}
	} );
	return error;
};

MultipleChoiceQuestion.propTypes = {
	children: checkChildrenAreOnlyAnswers,
	onAnswerChange: PropTypes.func.isRequired,
	question: PropTypes.string.isRequired,
};

export default MultipleChoiceQuestion;
