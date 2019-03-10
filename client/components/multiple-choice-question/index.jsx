/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
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

	render() {
		const { question, answers } = this.props;
		return (
			<div>
				<FormLegend>{ question }</FormLegend>
				{ answers.map( answer => {
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
