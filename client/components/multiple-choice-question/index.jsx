/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { memoize, shuffle } from 'lodash';
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
		answers: PropTypes.arrayOf( PropTypes.string ).isRequired,
	};

	/* pulled from https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#what-about-memoization */
	shuffleAnswers = memoize( answers => shuffle( answers ) );

	render() {
		const { question, answers } = this.props;
		const shuffledAnswers = this.shuffleAnswers( answers );
		return (
			<div>
				<FormLegend>{ question }</FormLegend>
				{ shuffledAnswers.map( answer => {
					return (
						<FormLabel key={ answer }>
							<FormRadio name={ answer } value={ answer } />
							<span>{ answer }</span>
						</FormLabel>
					);
				} ) }
			</div>
		);
	}
}
