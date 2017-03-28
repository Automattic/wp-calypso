/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';

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
			<label className="nps-survey__recommendation-option">
				<input type="radio"
					name="nps-survey-recommendation-option"
					value={ this.props.value }
					checked={ this.props.selected }
					disabled={ this.props.disabled }
					onChange={ this.handleChange }
				/>
				<span>{ this.props.value }</span>
			</label>
		);
	}
}

export default RecommendationOption;
