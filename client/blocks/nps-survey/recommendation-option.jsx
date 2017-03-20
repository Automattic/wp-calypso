/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import FormRadio from 'components/forms/form-radio';
import FormLabel from 'components/forms/form-label';

class RecommendationOption extends Component {
	constructor( props ) {
		super( props );
		this.handleChange = this.handleChange.bind( this );
	}

	static propTypes = {
		disabled: PropTypes.bool,
		selected: PropTypes.bool,
		value: PropTypes.number,
	}

	handleChange( event ) {
		this.props.onChange( parseInt( event.target.value, 10 ) );
	}

	render() {
		return (
			<FormLabel>
				<FormRadio
					className="nps-survey__recommendation-option"
					name="nps-survey-recommendation-option"
					value={ this.props.value }
					checked={ this.props.selected }
					disabled={ this.props.disabled }
					onChange={ this.handleChange }
				/>
				<span>{ this.props.value }</span>
			</FormLabel>
		);
	}
}

export default RecommendationOption;
