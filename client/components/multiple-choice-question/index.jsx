/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { memoize, pick, shuffle, values } from 'lodash';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormRadio from 'components/forms/form-radio';

export default class MultipleChoiceQuestion extends Component {
	static propTypes = {
		question: PropTypes.string.isRequired,
		answers: PropTypes.arrayOf(
			PropTypes.shape( {
				prompt: PropTypes.string.isRequired,
				doNotShuffle: PropTypes.bool,
				textInput: PropTypes.bool,
				textInputPrompt: PropTypes.bool,
			} )
		).isRequired,
		onAnswerSelected: PropTypes.func,
	};

	state = {
		selectedAnswer: null,
	};

	/* pulled from https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#what-about-memoization */
	shuffleAnswers = memoize(
		answers => {
			const shuffles = shuffle( answers.filter( ( { doNotShuffle } ) => ! doNotShuffle ) );
			return answers.map( answer => ( answer.doNotShuffle ? answer : shuffles.pop() ) );
		},
		answers =>
			answers
				.map( answer => values( pick( answer, 'prompt', 'doNotShuffle' ) ).join( '_' ) )
				.join( '-' )
	);

	onAnswerSelected = event => {
		const selectedAnswer = event.currentTarget.value;
		this.setState( { selectedAnswer } );
		if ( this.props.onAnswerSelected ) {
			this.props.onAnswerSelected( selectedAnswer );
		}
	};

	render() {
		const { question, answers } = this.props;
		const { selectedAnswer } = this.state;

		const shuffledAnswers = this.shuffleAnswers( answers );
		return (
			<div>
				<FormLegend>{ question }</FormLegend>
				{ shuffledAnswers.map( ( { prompt } ) => {
					return (
						<FormLabel key={ prompt }>
							<FormRadio
								name={ prompt }
								value={ prompt }
								onChange={ this.onAnswerSelected }
								checked={ prompt === selectedAnswer }
							/>
							<span>{ prompt }</span>
						</FormLabel>
					);
				} ) }
			</div>
		);
	}
}
